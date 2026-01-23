"""
Steam Deals ETL Pipeline
Fetches discounted games, enriches with Steam Deck compatibility, and loads to Supabase.
"""

import os
import time
import logging
from datetime import datetime
from typing import List, Dict, Optional
import requests
from supabase import create_client, Client

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Constants
FEATURED_URL = "https://store.steampowered.com/api/featuredcategories/?l=english&cc=us"
APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails?appids={}"
MIN_DISCOUNT = 50
RATE_LIMIT_DELAY = 1.5  # seconds between API calls

# Supabase Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # Use service role for write access

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_discount_list() -> List[Dict]:
    """
    Fetch the list of games on sale from Steam's featured categories API.
    
    Returns:
        List of game dictionaries with basic discount information
    """
    logger.info("Fetching discount list from Steam...")
    
    try:
        response = requests.get(FEATURED_URL, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        specials = data.get("specials", {}).get("items", [])
        logger.info(f"Found {len(specials)} games in specials")
        
        # Filter games with discount >= MIN_DISCOUNT
        filtered_games = [
            {
                "app_id": str(game["id"]),
                "name": game["name"],
                "final_price": game.get("final_price", 0) / 100.0,  # Convert cents to dollars
                "original_price": game.get("original_price", 0) / 100.0,
                "discount_percent": game.get("discount_percent", 0),
                "header_image": game.get("large_capsule_image", ""),
            }
            for game in specials
            if game.get("discount_percent", 0) >= MIN_DISCOUNT
        ]
        
        logger.info(f"Filtered to {len(filtered_games)} games with {MIN_DISCOUNT}%+ discount")
        return filtered_games
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch discount list: {e}")
        return []


def enrich_with_steam_deck_data(game: Dict) -> Dict:
    """
    Enrich game data with Steam Deck compatibility and additional metadata.
    
    Steam Deck Verified categories:
    - Category ID 59: Full Controller Support (often Deck compatible)
    - Category ID 18: Partial Controller Support
    - Check for 'steam_deck' in platforms or categories
    
    Args:
        game: Basic game information dictionary
        
    Returns:
        Enriched game dictionary with additional fields
    """
    app_id = game["app_id"]
    logger.info(f"Enriching data for {game['name']} (App ID: {app_id})")
    
    try:
        response = requests.get(APP_DETAILS_URL.format(app_id), timeout=30)
        response.raise_for_status()
        data = response.json()
        
        # Check if the response is valid
        if not data or str(app_id) not in data:
            logger.warning(f"No data returned for app {app_id}")
            return {**game, "steam_deck_compatible": False, "metacritic_score": None}
        
        app_data = data[str(app_id)]
        
        # Check if the request was successful
        if not app_data.get("success", False):
            logger.warning(f"API returned success=False for app {app_id}")
            return {**game, "steam_deck_compatible": False, "metacritic_score": None}
        
        details = app_data.get("data", {})
        
        # Check Steam Deck compatibility
        # Method 1: Check categories for controller support (proxy for Deck compatibility)
        categories = details.get("categories", [])
        category_ids = [cat.get("id") for cat in categories]
        
        # Category 59 = Full Controller Support (good indicator for Steam Deck)
        # Category 18 = Partial Controller Support
        has_controller_support = 59 in category_ids or 18 in category_ids
        
        # Method 2: Check platforms for Linux support (Steam Deck runs on Linux)
        platforms = details.get("platforms", {})
        has_linux = platforms.get("linux", False)
        
        # Method 3: Check if it's a native Steam Deck title (look for "Steam Deck" in supported platforms)
        # Note: This is not directly available in the public API, so we use controller support as proxy
        steam_deck_compatible = has_controller_support or has_linux
        
        # Get Metacritic score
        metacritic = details.get("metacritic", {})
        metacritic_score = metacritic.get("score", None)
        
        # Update header image if available (higher quality)
        header_image = details.get("header_image", game.get("header_image", ""))
        
        enriched = {
            **game,
            "steam_deck_compatible": steam_deck_compatible,
            "metacritic_score": metacritic_score,
            "header_image": header_image,
        }
        
        logger.info(
            f"Enriched {game['name']}: Deck={steam_deck_compatible}, "
            f"Metacritic={metacritic_score}, Controller={has_controller_support}"
        )
        
        return enriched
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch details for app {app_id}: {e}")
        return {**game, "steam_deck_compatible": False, "metacritic_score": None}
    except Exception as e:
        logger.error(f"Unexpected error enriching app {app_id}: {e}")
        return {**game, "steam_deck_compatible": False, "metacritic_score": None}


def load_to_supabase(games: List[Dict]) -> int:
    """
    Load enriched game data to Supabase using upsert operation.
    
    Args:
        games: List of enriched game dictionaries
        
    Returns:
        Number of games successfully loaded
    """
    if not games:
        logger.warning("No games to load")
        return 0
    
    logger.info(f"Loading {len(games)} games to Supabase...")
    
    # Prepare records for database
    records = []
    for game in games:
        records.append({
            "app_id": game["app_id"],
            "name": game["name"],
            "original_price": float(game["original_price"]),
            "final_price": float(game["final_price"]),
            "discount_percent": int(game["discount_percent"]),
            "steam_deck_compatible": bool(game.get("steam_deck_compatible", False)),
            "metacritic_score": game.get("metacritic_score"),
            "header_image": game.get("header_image", ""),
        })
    
    try:
        # Perform upsert (insert or update on conflict)
        result = supabase.table("steam_deals").upsert(
            records,
            on_conflict="app_id"  # Use app_id as the unique key
        ).execute()
        
        loaded_count = len(result.data) if result.data else 0
        logger.info(f"Successfully loaded {loaded_count} games to database")
        return loaded_count
        
    except Exception as e:
        logger.error(f"Failed to load data to Supabase: {e}")
        return 0


def run_etl_pipeline():
    """
    Execute the complete ETL pipeline.
    """
    start_time = time.time()
    logger.info("=" * 60)
    logger.info("Starting Steam Deals ETL Pipeline")
    logger.info("=" * 60)
    
    # Step 1: Fetch discount list
    games = fetch_discount_list()
    if not games:
        logger.error("No games fetched. Exiting pipeline.")
        return
    
    logger.info(f"\nStep 1 Complete: Fetched {len(games)} games with {MIN_DISCOUNT}%+ discount")
    
    # Step 2: Enrich with Steam Deck data
    logger.info("\nStep 2: Enriching games with Steam Deck compatibility...")
    enriched_games = []
    
    for idx, game in enumerate(games, 1):
        logger.info(f"Processing {idx}/{len(games)}: {game['name']}")
        
        enriched = enrich_with_steam_deck_data(game)
        enriched_games.append(enriched)
        
        # Rate limiting: sleep between requests to avoid Steam API ban
        if idx < len(games):  # Don't sleep after the last item
            logger.debug(f"Sleeping {RATE_LIMIT_DELAY}s to respect rate limits...")
            time.sleep(RATE_LIMIT_DELAY)
    
    logger.info(f"\nStep 2 Complete: Enriched {len(enriched_games)} games")
    
    # Step 3: Load to database
    logger.info("\nStep 3: Loading to Supabase...")
    loaded_count = load_to_supabase(enriched_games)
    
    # Summary
    elapsed_time = time.time() - start_time
    logger.info("\n" + "=" * 60)
    logger.info("ETL Pipeline Complete")
    logger.info("=" * 60)
    logger.info(f"Total games fetched: {len(games)}")
    logger.info(f"Total games enriched: {len(enriched_games)}")
    logger.info(f"Total games loaded: {loaded_count}")
    logger.info(f"Execution time: {elapsed_time:.2f} seconds")
    logger.info("=" * 60)


if __name__ == "__main__":
    run_etl_pipeline()
