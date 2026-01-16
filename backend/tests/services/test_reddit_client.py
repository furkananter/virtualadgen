"""
Reddit Service Unit Tests

Tests the Reddit client's fallback logic using mocked HTTP responses.
Run with: pytest tests/services/test_reddit_client.py -v
"""

import pytest
import respx
from httpx import Response

from app.services.reddit.client import (
    fetch_subreddit_posts,
    REDDIT_BASE_URL,
    SOCIALGREP_URL,
)
from app.services.reddit.constants import FALLBACK_DATA


@pytest.fixture
def mock_reddit_response() -> dict:
    """Sample Reddit API response."""
    return {
        "data": {
            "children": [
                {
                    "data": {
                        "title": "Amazing espresso shot today",
                        "score": 150,
                        "url": "https://reddit.com/r/espresso/1",
                        "num_comments": 25,
                    }
                },
                {
                    "data": {
                        "title": "New grinder recommendations",
                        "score": 89,
                        "url": "https://reddit.com/r/espresso/2",
                        "num_comments": 42,
                    }
                },
            ]
        }
    }


@pytest.fixture
def mock_socialgrep_response() -> dict:
    """Sample Socialgrep API response."""
    return {
        "data": [
            {
                "title": "Best beans for latte art",
                "score": 75,
                "url": "https://reddit.com/r/espresso/3",
                "num_comments": 18,
            }
        ]
    }


@pytest.mark.asyncio
@respx.mock
async def test_reddit_success(mock_reddit_response: dict) -> None:
    """Test successful fetch from Reddit direct API."""
    respx.get(f"{REDDIT_BASE_URL}/r/espresso/hot.json").mock(
        return_value=Response(200, json=mock_reddit_response)
    )

    result = await fetch_subreddit_posts("espresso", sort="hot", limit=5)

    assert result["fallback"] is False
    assert len(result["posts"]) == 2
    assert "espresso" in result["keywords"] or "grinder" in result["keywords"]


@pytest.mark.asyncio
@respx.mock
async def test_reddit_blocked_fallback_socialgrep(
    mock_socialgrep_response: dict,
) -> None:
    """Test fallback to Socialgrep when Reddit returns 403."""
    respx.get(f"{REDDIT_BASE_URL}/r/espresso/hot.json").mock(
        return_value=Response(403, text="Forbidden")
    )
    respx.get(SOCIALGREP_URL).mock(
        return_value=Response(200, json=mock_socialgrep_response)
    )

    result = await fetch_subreddit_posts("espresso", sort="hot", limit=5)

    assert result["fallback"] is False
    assert len(result["posts"]) >= 1


@pytest.mark.asyncio
@respx.mock
async def test_both_fail_static_fallback() -> None:
    """Test static fallback when both APIs fail."""
    respx.get(f"{REDDIT_BASE_URL}/r/espresso/hot.json").mock(
        return_value=Response(500, text="Server Error")
    )
    respx.get(SOCIALGREP_URL).mock(return_value=Response(500, text="Server Error"))

    result = await fetch_subreddit_posts("espresso", sort="hot", limit=5)

    assert result["fallback"] is True
    assert result["trends"] == FALLBACK_DATA["trends"]


@pytest.mark.asyncio
async def test_invalid_subreddit_rejected() -> None:
    """Test that invalid subreddit names return fallback immediately."""
    result = await fetch_subreddit_posts("!!invalid@@", sort="hot", limit=5)

    assert result["fallback"] is True


@pytest.mark.asyncio
@respx.mock
async def test_keywords_extracted(mock_reddit_response: dict) -> None:
    """Test that keywords are properly extracted from post titles."""
    respx.get(f"{REDDIT_BASE_URL}/r/espresso/hot.json").mock(
        return_value=Response(200, json=mock_reddit_response)
    )

    result = await fetch_subreddit_posts("espresso", sort="hot", limit=5)

    keywords = result.get("keywords", [])
    assert isinstance(keywords, list)
    assert len(keywords) > 0
    # Should extract meaningful words like "espresso", "grinder", "shot"
    assert any(
        word in keywords for word in ["espresso", "grinder", "shot", "recommendations"]
    )
