"""
Quick test script to verify Steam API connectivity and data structure
"""

import requests
import json

print("Testing Steam API connectivity...\n")

# Test 1: Featured Categories
print("1. Testing Featured Categories API...")
try:
    response = requests.get(
        "https://store.steampowered.com/api/featuredcategories/?l=english&cc=us",
        timeout=10
    )
    data = response.json()
    specials = data.get("specials", {}).get("items", [])
    print(f"✅ Success! Found {len(specials)} games in specials")
    
    if specials:
        sample = specials[0]
        print(f"\nSample game:")
        print(f"  - ID: {sample['id']}")
        print(f"  - Name: {sample['name']}")
        print(f"  - Discount: {sample.get('discount_percent', 0)}%")
        print(f"  - Price: ${sample.get('final_price', 0) / 100:.2f}")
except Exception as e:
    print(f"❌ Failed: {e}")

# Test 2: App Details
print("\n2. Testing App Details API (Cyberpunk 2077 - App ID 1091500)...")
try:
    response = requests.get(
        "https://store.steampowered.com/api/appdetails?appids=1091500",
        timeout=10
    )
    data = response.json()
    
    if data and "1091500" in data:
        app_data = data["1091500"]
        if app_data.get("success"):
            details = app_data["data"]
            print(f"✅ Success!")
            print(f"\nGame Details:")
            print(f"  - Name: {details.get('name')}")
            print(f"  - Type: {details.get('type')}")
            
            # Check categories
            categories = details.get("categories", [])
            print(f"  - Categories: {len(categories)}")
            for cat in categories[:3]:
                print(f"    • {cat.get('description')} (ID: {cat.get('id')})")
            
            # Check platforms
            platforms = details.get("platforms", {})
            print(f"  - Platforms: Windows={platforms.get('windows')}, "
                  f"Mac={platforms.get('mac')}, Linux={platforms.get('linux')}")
            
            # Check metacritic
            metacritic = details.get("metacritic", {})
            if metacritic:
                print(f"  - Metacritic: {metacritic.get('score')}")
        else:
            print(f"❌ API returned success=False")
    else:
        print(f"❌ Invalid response structure")
except Exception as e:
    print(f"❌ Failed: {e}")

print("\n" + "="*60)
print("API Test Complete!")
print("If both tests passed, you're ready to run the ETL pipeline.")
print("="*60)
