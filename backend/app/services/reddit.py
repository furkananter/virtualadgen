"""Reddit API integration via public JSON endpoint."""

from typing import Any
from urllib.parse import quote
import httpx
import logging
import re

logger = logging.getLogger(__name__)

REDDIT_BASE_URL = "https://www.reddit.com"

# Subreddit name pattern: 3-21 chars, alphanumeric + underscores, can't start with _
SUBREDDIT_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_]{2,20}$")

# Fallback data when Reddit blocks us
FALLBACK_DATA = {
    "posts": [],
    "trends": ["trending", "viral", "aesthetic", "premium", "luxury"],
    "top_post": "Latest trending styles and innovations",
    "keywords": ["modern", "aesthetic", "quality", "premium"],
    "community_vibe": "quality-focused enthusiasts",
    "fallback": True,
}

# Common Reddit noise to filter out (generic, not category-specific)
NOISE_PATTERNS = [
    r"^\[.*?\]",  # [MOD], [MEGATHREAD], etc.
    r"^(daily|weekly|monthly)\s+(thread|discussion|question)",
    r"^(ask|ama|iama)\s+",
    r"^(meta|rule|announcement)",
    r"r/\w+\s+(shopping|help|desk|question|megathread)",  # pinned community threads
]

STOP_WORDS = {
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
    "mod",
    "thread",
    "daily",
    "weekly",
    "question",
    "ask",
    "anyone",
    "does",
    "any",
    "got",
    "get",
    "getting",
    "new",
    "first",
    "one",
    "two",
    "like",
    "want",
    "looking",
    "help",
    "need",
    "best",
    "good",
    "bad",
    "make",
    "made",
    "into",
    "them",
    "their",
    "your",
    "stuff",
    "really",
    "think",
    "know",
}


def _validate_subreddit(subreddit: str) -> str:
    """
    Validate and sanitize subreddit name.

    Args:
        subreddit: Raw subreddit name input.

    Returns:
        Sanitized subreddit name.

    Raises:
        ValueError: If subreddit name is invalid.
    """
    if not subreddit:
        raise ValueError("Subreddit name cannot be empty")

    # Strip whitespace and remove r/ prefix if present
    cleaned = subreddit.strip()
    if cleaned.lower().startswith("r/"):
        cleaned = cleaned[2:]

    if not SUBREDDIT_PATTERN.match(cleaned):
        raise ValueError(
            f"Invalid subreddit name '{subreddit}': must be 3-21 characters, "
            "alphanumeric and underscores only, cannot start with underscore"
        )

    return cleaned


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
        If the subreddit name is invalid, returns FALLBACK_DATA.copy() instead
        of raising an exception.
    """
    # Validate and sanitize subreddit name
    try:
        validated_subreddit = _validate_subreddit(subreddit)
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

        return extract_insights(posts, validated_subreddit)

    except (httpx.HTTPStatusError, httpx.RequestError) as e:
        logger.warning(f"Reddit API failed for r/{subreddit}: {e}. Using fallback.")
        return FALLBACK_DATA.copy()


def extract_insights(posts: list[dict[str, Any]], subreddit: str) -> dict[str, Any]:
    """
    Extract meaningful insights from Reddit posts.

    Args:
        posts: List of post dictionaries.
        subreddit: Subreddit name for context.

    Returns:
        Rich insights dictionary.
    """
    if not posts:
        return FALLBACK_DATA.copy()

    # Filter out noise posts (mod threads, daily questions, etc.)
    quality_posts = _filter_quality_posts(posts)

    # Get top post by engagement (score + comments)
    top_post = _get_top_post(quality_posts or posts)

    # Extract meaningful keywords
    keywords = _extract_keywords(quality_posts or posts)

    # Generate community vibe description
    community_vibe = _analyze_community_vibe(keywords, subreddit)

    # Legacy trends field for backward compatibility
    trends = keywords[:6] if keywords else FALLBACK_DATA["trends"].copy()

    return {
        "posts": posts,
        "top_post": top_post,
        "keywords": keywords,
        "trends": trends,
        "community_vibe": community_vibe,
        "fallback": False,
    }


def _filter_quality_posts(posts: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Filter out mod threads, daily questions, and other noise."""
    quality = []
    for post in posts:
        title = post.get("title", "").lower()
        is_noise = any(re.search(pattern, title, re.I) for pattern in NOISE_PATTERNS)
        if not is_noise and post.get("score", 0) > 0:
            quality.append(post)
    return quality


def _get_top_post(posts: list[dict[str, Any]]) -> str:
    """Get the most engaging post title, preferring positive content."""
    if not posts:
        return FALLBACK_DATA["top_post"]

    # Score posts: high upvotes + reasonable comment ratio = quality content
    # Controversial posts often have low upvotes but many comments
    def quality_score(p: dict) -> float:
        score = p.get("score", 0)
        comments = p.get("num_comments", 0)
        # Penalize posts with low score but high comments (controversial)
        if score < 50 and comments > 50:
            return score * 0.5
        return score + (comments * 0.3)

    sorted_posts = sorted(posts, key=quality_score, reverse=True)

    top_title = sorted_posts[0].get("title", "")

    # Clean up the title
    cleaned = re.sub(r"^\[.*?\]\s*", "", top_title)  # Remove [tags]
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    return cleaned if cleaned else FALLBACK_DATA["top_post"]


def _extract_keywords(posts: list[dict[str, Any]], max_keywords: int = 8) -> list[str]:
    """Extract meaningful keywords from post titles."""
    word_scores: dict[str, float] = {}

    for post in posts:
        title = post.get("title", "")
        score = post.get("score", 1)

        # Clean title
        title = re.sub(r"^\[.*?\]\s*", "", title)  # Remove [tags]
        title = re.sub(r"[^\w\s-]", " ", title)  # Keep words and hyphens

        words = title.lower().split()

        for word in words:
            cleaned = word.strip("-")
            if (
                cleaned
                and len(cleaned) > 2
                and cleaned not in STOP_WORDS
                and not cleaned.isdigit()
            ):
                # Weight by post score
                word_scores[cleaned] = word_scores.get(cleaned, 0) + (1 + score * 0.1)

    # Sort by score and return top keywords
    sorted_words = sorted(word_scores.items(), key=lambda x: x[1], reverse=True)
    return [word for word, _ in sorted_words[:max_keywords]]


def _analyze_community_vibe(keywords: list[str], subreddit: str) -> str:
    """Generate a brief community vibe description."""
    if not keywords:
        return "engaged community"

    # Map common keyword patterns to vibes
    vibe_mappings = {
        ("espresso", "coffee", "brewing", "roast"): "specialty coffee enthusiasts",
        (
            "mechanical",
            "keyboard",
            "switches",
            "keycaps",
        ): "tech-savvy customization fans",
        ("skincare", "routine", "products", "skin"): "beauty and self-care focused",
        ("fashion", "style", "outfit", "wear"): "style-conscious trendsetters",
        ("gaming", "setup", "rgb", "pc"): "gaming and tech enthusiasts",
        ("fragrance", "perfume", "scent", "cologne"): "fragrance connoisseurs",
        ("headphones", "audio", "sound", "music"): "audiophile community",
        ("makeup", "beauty", "cosmetics", "look"): "makeup and beauty lovers",
    }

    keyword_set = set(keywords[:5])

    for pattern_words, vibe in vibe_mappings.items():
        if keyword_set & set(pattern_words):
            return vibe

    # Default: use top keywords
    top_3 = keywords[:3]
    if top_3:
        return f"{', '.join(top_3)} enthusiasts"

    return "engaged community"
