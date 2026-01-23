"""
TMDB Movies ETL Pipeline
Fetches popular and trending movies from TMDB API and loads to Supabase.
"""

import os
import time
import logging
from datetime import datetime, timedelta
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
TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"
RATE_LIMIT_DELAY = 0.3  # TMDB allows ~40 requests/second

# Supabase Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Missing Supabase credentials in environment variables")

if not TMDB_API_KEY:
    raise ValueError("Missing TMDB_API_KEY in environment variables")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def fetch_popular_movies(page: int = 1) -> List[Dict]:
    """
    Fetch popular movies from TMDB API.
    
    Args:
        page: Page number to fetch (1-based)
        
    Returns:
        List of movie dictionaries
    """
    logger.info(f"Fetching popular movies (page {page})...")
    
    try:
        response = requests.get(
            f"{TMDB_BASE_URL}/movie/popular",
            params={
                "api_key": TMDB_API_KEY,
                "language": "en-US",
                "page": page,
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        movies = data.get("results", [])
        logger.info(f"Fetched {len(movies)} popular movies")
        return movies
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch popular movies: {e}")
        return []


def fetch_trending_movies() -> List[Dict]:
    """
    Fetch trending movies from TMDB API (trending this week).
    
    Returns:
        List of movie dictionaries
    """
    logger.info("Fetching trending movies...")
    
    try:
        response = requests.get(
            f"{TMDB_BASE_URL}/trending/movie/week",
            params={
                "api_key": TMDB_API_KEY,
                "language": "en-US",
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        movies = data.get("results", [])
        logger.info(f"Fetched {len(movies)} trending movies")
        return movies
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch trending movies: {e}")
        return []


def fetch_top_rated_movies(page: int = 1) -> List[Dict]:
    """
    Fetch top-rated movies from TMDB API.
    
    Args:
        page: Page number to fetch (1-based)
        
    Returns:
        List of movie dictionaries
    """
    logger.info(f"Fetching top-rated movies (page {page})...")
    
    try:
        response = requests.get(
            f"{TMDB_BASE_URL}/movie/top_rated",
            params={
                "api_key": TMDB_API_KEY,
                "language": "en-US",
                "page": page,
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        movies = data.get("results", [])
        logger.info(f"Fetched {len(movies)} top-rated movies")
        return movies
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch top-rated movies: {e}")
        return []


def fetch_now_playing_movies(page: int = 1) -> List[Dict]:
    """
    Fetch currently playing movies from TMDB API.
    
    Args:
        page: Page number to fetch (1-based)
        
    Returns:
        List of movie dictionaries
    """
    logger.info(f"Fetching now playing movies (page {page})...")
    
    try:
        response = requests.get(
            f"{TMDB_BASE_URL}/movie/now_playing",
            params={
                "api_key": TMDB_API_KEY,
                "language": "en-US",
                "page": page,
            },
            timeout=30
        )
        response.raise_for_status()
        data = response.json()
        
        movies = data.get("results", [])
        logger.info(f"Fetched {len(movies)} now playing movies")
        return movies
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch now playing movies: {e}")
        return []


def transform_movie_data(movies: List[Dict]) -> List[Dict]:
    """
    Transform TMDB movie data to match our database schema.
    
    Args:
        movies: List of raw TMDB movie dictionaries
        
    Returns:
        List of transformed movie dictionaries
    """
    transformed = []
    
    for movie in movies:
        try:
            transformed.append({
                "tmdb_id": str(movie["id"]),
                "title": movie.get("title", ""),
                "original_title": movie.get("original_title"),
                "release_date": movie.get("release_date") or None,
                "rating": float(movie.get("vote_average", 0)) if movie.get("vote_average") else None,
                "vote_count": int(movie.get("vote_count", 0)),
                "popularity": float(movie.get("popularity", 0)),
                "overview": movie.get("overview"),
                "poster_path": movie.get("poster_path"),
                "backdrop_path": movie.get("backdrop_path"),
                "genre_ids": movie.get("genre_ids", []),
                "adult": movie.get("adult", False),
                "original_language": movie.get("original_language"),
            })
        except Exception as e:
            logger.error(f"Failed to transform movie {movie.get('id', 'unknown')}: {e}")
            continue
    
    logger.info(f"Transformed {len(transformed)} movies")
    return transformed


def load_to_supabase(movies: List[Dict]) -> int:
    """
    Load movie data to Supabase using upsert operation.
    
    Args:
        movies: List of transformed movie dictionaries
        
    Returns:
        Number of movies successfully loaded
    """
    if not movies:
        logger.warning("No movies to load")
        return 0
    
    logger.info(f"Loading {len(movies)} movies to Supabase...")
    
    try:
        # Perform upsert (insert or update on conflict)
        result = supabase.table("movies").upsert(
            movies,
            on_conflict="tmdb_id"
        ).execute()
        
        loaded_count = len(result.data) if result.data else 0
        logger.info(f"Successfully loaded {loaded_count} movies to database")
        return loaded_count
        
    except Exception as e:
        logger.error(f"Failed to load movies to Supabase: {e}")
        return 0


def run_etl_pipeline():
    """
    Run the complete ETL pipeline for TMDB movies.
    """
    logger.info("=" * 60)
    logger.info("Starting TMDB Movies ETL Pipeline")
    logger.info("=" * 60)
    
    all_movies = []
    
    # Fetch from multiple sources
    sources = [
        ("Popular", fetch_popular_movies, [1, 2]),  # 2 pages of popular
        ("Trending", fetch_trending_movies, []),
        ("Top Rated", fetch_top_rated_movies, [1]),
        ("Now Playing", fetch_now_playing_movies, [1]),
    ]
    
    for source_name, fetch_func, pages in sources:
        logger.info(f"\n--- Fetching {source_name} Movies ---")
        
        if pages:
            for page in pages:
                movies = fetch_func(page)
                all_movies.extend(movies)
                time.sleep(RATE_LIMIT_DELAY)
        else:
            movies = fetch_func()
            all_movies.extend(movies)
            time.sleep(RATE_LIMIT_DELAY)
    
    # Remove duplicates based on TMDB ID
    unique_movies = {str(m["id"]): m for m in all_movies}.values()
    logger.info(f"\nTotal unique movies: {len(unique_movies)}")
    
    # Transform data
    transformed_movies = transform_movie_data(list(unique_movies))
    
    # Load to database
    loaded_count = load_to_supabase(transformed_movies)
    
    logger.info("=" * 60)
    logger.info(f"ETL Pipeline Complete: {loaded_count} movies loaded")
    logger.info("=" * 60)


if __name__ == "__main__":
    run_etl_pipeline()
