"""Reddit HTTP client for fetching subreddit posts."""

import logging
import random
from typing import Any
from urllib.parse import quote

import httpx

from app.config import settings
from .constants import FALLBACK_DATA
from .validator import validate_subreddit
from .analyzer import extract_insights

logger = logging.getLogger(__name__)

# Using standard reddit.com for primary API access
REDDIT_BASE_URL = "https://www.reddit.com"

# Apify Reddit Scraper Actor ID (use ID instead of slug for reliability)
APIFY_ACTOR_ID = "TwqHBuZZPHJxiQrTU"

# Rotate user agents to avoid fingerprinting
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
]


def _get_headers() -> dict[str, str]:
    """Get randomized headers to avoid fingerprinting."""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
    }


async def fetch_subreddit_posts(
    subreddit: str,
    sort: str = "hot",
    limit: int = 10,
) -> dict[str, Any]:
    """
    Fetch posts from a subreddit and extract meaningful insights.

    Tries Reddit API first, falls back to Apify, then static data.

    Args:
        subreddit: Name of the subreddit.
        sort: Sort order (hot, new, top, rising).
        limit: Number of posts to fetch.

    Returns:
        Dictionary with posts, keywords, top_post, and community insights.
    """
    # Validate and sanitize subreddit name
    try:
        validated_subreddit = validate_subreddit(subreddit)
    except ValueError as e:
        logger.warning(f"Invalid subreddit: {e}. Using fallback.")
        return FALLBACK_DATA.copy()

    # Try Reddit direct API first
    posts = await _fetch_from_reddit(validated_subreddit, sort, limit)

    # Fallback to Apify if Reddit fails
    if not posts and settings.apify_api_key:
        logger.info(f"Trying Apify fallback for r/{validated_subreddit}")
        posts = await _fetch_from_apify(validated_subreddit, sort, limit)

    # Return insights or static fallback
    if posts:
        return extract_insights(posts, validated_subreddit)

    logger.warning(f"All sources failed for r/{subreddit}. Using static fallback.")
    return FALLBACK_DATA.copy()


async def _fetch_from_reddit(
    subreddit: str, sort: str, limit: int
) -> list[dict[str, Any]]:
    """Fetch posts directly from Reddit's JSON API."""
    encoded_subreddit = quote(subreddit, safe="")

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(
                f"{REDDIT_BASE_URL}/r/{encoded_subreddit}/{sort}.json",
                headers=_get_headers(),
                params={"limit": limit, "raw_json": 1},
            )
            response.raise_for_status()
            data = response.json()

        return _parse_reddit_posts(data)

    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.warning(f"Reddit API failed for r/{subreddit}: {e}. Using fallback.")
        return []


async def _fetch_from_apify(
    subreddit: str, sort: str, limit: int
) -> list[dict[str, Any]]:
    """Fetch posts from Apify Reddit Scraper as fallback."""
    try:
        import asyncio

        # Define blocking operation to run in thread
        def _run_apify_sync() -> list[dict[str, Any]]:
            from apify_client import ApifyClient

            client = ApifyClient(settings.apify_api_key)

            # Map sort to Apify's subredditSort parameter
            valid_sorts = ["relevance", "hot", "top", "new", "comments", "rising"]
            if sort not in valid_sorts:
                logger.debug(f"Unknown sort '{sort}' for Apify, defaulting to 'hot'")
            apify_sort = sort if sort in valid_sorts else "hot"

            run_input = {
                "subredditName": subreddit,
                "subredditSort": apify_sort,
                "subredditTimeframe": "week",
                "maxPosts": max(limit, 10),  # Apify requires minimum 10
                "scrapeComments": False,
                "includeNsfw": False,
            }

            # Run the actor (blocking)
            run = client.actor(APIFY_ACTOR_ID).call(run_input=run_input)

            # Fetch results from the dataset (blocking iteration)
            posts = []
            for item in client.dataset(run["defaultDatasetId"]).iterate_items():
                if item.get("kind") == "post":
                    posts.append(
                        {
                            "title": item.get("title", ""),
                            "score": item.get("score", 0),
                            "url": item.get("url", ""),
                            "num_comments": item.get("num_comments", 0),
                        }
                    )
                if len(posts) >= limit:
                    break

            return posts

        # Offload blocking I/O to thread pool
        posts = await asyncio.to_thread(_run_apify_sync)

        logger.info(f"Apify fetched {len(posts)} posts for r/{subreddit}")
        return posts

    except Exception as e:
        logger.warning(f"Apify fallback failed for r/{subreddit}: {e}")
        return []


def _parse_reddit_posts(data: dict[str, Any]) -> list[dict[str, Any]]:
    """Parse Reddit API response into post list."""
    posts = []
    for child in data.get("data", {}).get("children", []):
        post_data = child.get("data", {})
        posts.append(
            {
                "title": post_data.get("title", ""),
                "score": post_data.get("score", 0),
                "url": post_data.get("url", ""),
                "num_comments": post_data.get("num_comments", 0),
            }
        )
    return posts
