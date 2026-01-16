"""Reddit HTTP client for fetching subreddit posts."""

import logging
from typing import Any
from urllib.parse import quote

import httpx

from .constants import REDDIT_BASE_URL, FALLBACK_DATA
from .validator import validate_subreddit
from .analyzer import extract_insights

logger = logging.getLogger(__name__)


async def fetch_subreddit_posts(
    subreddit: str,
    sort: str = "hot",
    limit: int = 10,
) -> dict[str, Any]:
    """
    Fetch posts from a subreddit and extract meaningful insights.

    Args:
        subreddit: Name of the subreddit.
        sort: Sort order (hot, new, top, rising).
        limit: Number of posts to fetch.

    Returns:
        Dictionary with posts, keywords, top_post, and community insights.
        If the subreddit name is invalid or request fails, returns
        FALLBACK_DATA.copy() instead of raising an exception.
    """
    # Validate and sanitize subreddit name
    try:
        validated_subreddit = validate_subreddit(subreddit)
    except ValueError as e:
        logger.warning(f"Invalid subreddit: {e}. Using fallback.")
        return FALLBACK_DATA.copy()

    # URL-encode the subreddit name for safety
    encoded_subreddit = quote(validated_subreddit, safe="")

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(
                f"{REDDIT_BASE_URL}/r/{encoded_subreddit}/{sort}.json",
                headers=headers,
                params={"limit": limit, "raw_json": 1},
            )
            response.raise_for_status()
            data = response.json()

        posts = _parse_posts(data)
        return extract_insights(posts, validated_subreddit)

    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.warning(f"Reddit API failed for r/{subreddit}: {e}. Using fallback.")
        return FALLBACK_DATA.copy()


def _parse_posts(data: dict[str, Any]) -> list[dict[str, Any]]:
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
