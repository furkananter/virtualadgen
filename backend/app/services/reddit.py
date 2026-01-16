"""Reddit API integration via public JSON endpoint."""

from typing import Any
import httpx
import logging

logger = logging.getLogger(__name__)

REDDIT_BASE_URL = "https://www.reddit.com"

# Fallback trends when Reddit blocks us
FALLBACK_TRENDS = ["trending", "viral", "aesthetic", "premium", "luxury", "modern"]


async def fetch_subreddit_posts(
    subreddit: str,
    sort: str = "hot",
    limit: int = 10,
) -> dict[str, Any]:
    """
    Fetch posts from a subreddit using Reddit's public JSON endpoint.
    Falls back to curated trends if Reddit blocks the request.

    Args:
        subreddit: Name of the subreddit.
        sort: Sort order (hot, new, top, rising).
        limit: Number of posts to fetch.

    Returns:
        Dictionary containing posts and extracted trends.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Cache-Control": "max-age=0",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(
                f"{REDDIT_BASE_URL}/r/{subreddit}/{sort}.json",
                headers=headers,
                params={"limit": limit, "raw_json": 1},
            )
            response.raise_for_status()
            data = response.json()

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

        trends = extract_trends(posts)

        return {
            "posts": posts,
            "trends": trends,
        }

    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.warning(
            f"Reddit API blocked/failed for r/{subreddit}: {e}. Using fallback trends."
        )
        return _get_fallback_trends()


def _get_fallback_trends() -> dict[str, Any]:
    """Return fallback trends when Reddit blocks us."""
    return {"posts": [], "trends": FALLBACK_TRENDS, "fallback": True}


def extract_trends(posts: list[dict[str, Any]], max_trends: int = 10) -> list[str]:
    """
    Extract trending keywords from post titles.

    Args:
        posts: List of post dictionaries.
        max_trends: Maximum number of trends to return.

    Returns:
        List of trending keywords.
    """
    word_counts: dict[str, int] = {}
    stop_words = {
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "of",
        "with",
        "by",
        "from",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "must",
        "shall",
        "can",
        "need",
        "this",
        "that",
        "these",
        "those",
        "i",
        "you",
        "he",
        "she",
        "it",
        "we",
        "they",
        "what",
        "which",
        "who",
        "whom",
        "when",
        "where",
        "why",
        "how",
        "all",
        "each",
        "every",
        "both",
        "few",
        "more",
        "most",
        "other",
        "some",
        "such",
        "no",
        "not",
        "only",
        "own",
        "same",
        "so",
        "than",
        "too",
        "very",
        "just",
        "also",
        "now",
        "here",
        "there",
        "about",
        "after",
        "before",
    }

    for post in posts:
        title = post.get("title", "")
        words = title.lower().split()
        for word in words:
            cleaned = "".join(c for c in word if c.isalnum())
            if cleaned and len(cleaned) > 2 and cleaned not in stop_words:
                word_counts[cleaned] = word_counts.get(cleaned, 0) + 1

    sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
    return [word for word, _ in sorted_words[:max_trends]]
