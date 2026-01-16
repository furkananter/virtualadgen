"""
Reddit API Live Integration Test

Run this script to verify the Reddit service works with real APIs.

Usage:
    cd backend
    source venv/bin/activate
    python scripts/test_reddit_live.py
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()

from app.services.reddit import fetch_subreddit_posts  # noqa: E402


async def test_subreddit(subreddit: str) -> None:
    """Test fetching data from a subreddit."""
    print(f"\n{'='*60}")
    print(f"Testing r/{subreddit}")
    print("=" * 60)

    try:
        result = await fetch_subreddit_posts(subreddit, sort="hot", limit=5)

        is_fallback = result.get("fallback", False)
        posts = result.get("posts", [])
        keywords = result.get("keywords", [])
        trends = result.get("trends", [])
        vibe = result.get("community_vibe", "")
        top_post = result.get("top_post", "")

        if is_fallback:
            print("⚠️  Source: Static Fallback (API calls failed)")
        elif posts:
            print(f"✅ Source: Live API ({len(posts)} posts fetched)")
        else:
            print("⚠️  Source: Unknown (no posts)")

        print(
            f"\n📝 Top Post: {top_post[:80]}..."
            if len(top_post) > 80
            else f"\n📝 Top Post: {top_post}"
        )
        print(f"🔑 Keywords: {keywords[:6]}")
        print(f"📈 Trends: {trends[:5]}")
        print(f"🎭 Community Vibe: {vibe}")

        if posts:
            print("\n📄 Sample Posts:")
            for i, post in enumerate(posts[:3], 1):
                title = post.get("title", "")[:60]
                score = post.get("score", 0)
                print(f"   {i}. [{score:>5}⬆] {title}...")

    except Exception as e:
        print(f"❌ Error: {e}")


async def main() -> None:
    """Run integration tests on multiple subreddits."""
    print("\n🧪 Reddit API Integration Test")
    print("=" * 60)

    test_subreddits = [
        "SkincareAddiction",
        "mechanicalkeyboards",
        "espresso",
    ]

    for subreddit in test_subreddits:
        await test_subreddit(subreddit)

    print("\n" + "=" * 60)
    print("🧪 Testing Apify Direct Access (Fallback Check)")
    print("=" * 60)

    # Import private function for testing purposes
    from app.services.reddit.client import _fetch_from_apify

    try:
        posts = await _fetch_from_apify("SkincareAddiction", "hot", 3)
        if posts:
            print(f"✅ Apify Works! ({len(posts)} posts fetched)")
            print(f"   Sample Title: {posts[0].get('title', '')[:50]}...")
        else:
            print("❌ Apify returned no posts (Check API Token)")
    except Exception as e:
        print(f"❌ Apify Failed: {e}")

    print("\n" + "=" * 60)
    print("✅ Integration test complete!")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    asyncio.run(main())
