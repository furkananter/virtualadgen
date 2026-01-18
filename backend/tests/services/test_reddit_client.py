"""
Reddit Service Unit Tests

Tests the Reddit client's fallback logic using mocked HTTP responses.
Run with: pytest tests/services/test_reddit_client.py -v
"""

import pytest
import respx
from httpx import Response
from pytest_mock import MockerFixture

from app.services.reddit.client import (
    fetch_subreddit_posts,
    REDDIT_BASE_URL,
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
def mock_apify_posts() -> list[dict]:
    """Sample Apify Reddit Scraper response posts."""
    return [
        {
            "kind": "post",
            "title": "Best beans for latte art",
            "score": 75,
            "url": "https://reddit.com/r/espresso/3",
            "num_comments": 18,
        }
    ]


@pytest.mark.asyncio
@respx.mock
async def test_reddit_blocked_no_apify_key_uses_fallback(
    mocker: MockerFixture,
) -> None:
    """Test that static fallback is used when Reddit fails and no Apify key."""
    respx.get(f"{REDDIT_BASE_URL}/r/espresso/hot.json").mock(
        return_value=Response(403, text="Forbidden")
    )

    # Ensure no Apify key is set
    mocker.patch("app.services.reddit.client.settings.apify_api_key", None)

    result = await fetch_subreddit_posts("espresso", sort="hot", limit=5)

    # Should return static fallback data
    assert result["fallback"] is True
    assert result["keywords"] == FALLBACK_DATA["keywords"]


@pytest.mark.asyncio
@respx.mock
async def test_reddit_server_error_uses_fallback(mocker: MockerFixture) -> None:
    """Test static fallback when Reddit returns 500."""
    respx.get(f"{REDDIT_BASE_URL}/r/espresso/hot.json").mock(
        return_value=Response(500, text="Server Error")
    )

    # No Apify key
    mocker.patch("app.services.reddit.client.settings.apify_api_key", None)

    result = await fetch_subreddit_posts("espresso", sort="hot", limit=5)

    assert result["fallback"] is True
    assert result["keywords"] == FALLBACK_DATA["keywords"]


@pytest.mark.asyncio
@respx.mock
async def test_reddit_blocked_apify_fallback_succeeds(
    mock_apify_posts: list[dict], mocker: MockerFixture
) -> None:
    """Test that Apify fallback is used successfully when Reddit returns 403."""
    respx.get(f"{REDDIT_BASE_URL}/r/espresso/hot.json").mock(
        return_value=Response(403, text="Forbidden")
    )

    # Mock the Apify client
    mock_client = mocker.MagicMock()
    mock_run = {"defaultDatasetId": "test-dataset-id"}
    mock_client.actor.return_value.call.return_value = mock_run
    mock_client.dataset.return_value.iterate_items.return_value = iter(mock_apify_posts)

    mocker.patch("app.services.reddit.client.settings.apify_api_key", "test-key")
    mocker.patch("apify_client.ApifyClient", return_value=mock_client)

    result = await fetch_subreddit_posts("espresso", sort="hot", limit=5)

    # Should return data from Apify fallback
    assert result["fallback"] is False
    assert len(result["posts"]) >= 1


@pytest.mark.asyncio
@respx.mock
async def test_both_reddit_and_apify_fail_uses_static(
    mocker: MockerFixture,
) -> None:
    """Test static fallback when both Reddit and Apify fail."""
    respx.get(f"{REDDIT_BASE_URL}/r/espresso/hot.json").mock(
        return_value=Response(500, text="Server Error")
    )

    # Mock Apify to raise an exception
    mocker.patch("app.services.reddit.client.settings.apify_api_key", "test-key")
    mocker.patch("apify_client.ApifyClient", side_effect=Exception("Apify failed"))

    result = await fetch_subreddit_posts("espresso", sort="hot", limit=5)

    assert result["fallback"] is True
    assert result["keywords"] == FALLBACK_DATA["keywords"]


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
