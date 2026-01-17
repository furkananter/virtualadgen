"""Social media API routes."""

from typing import cast

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.models.schemas import RedditRequest, RedditResponse, RedditPost
from app.services.reddit import fetch_subreddit_posts


router = APIRouter(prefix="/api", tags=["social"])


def _safe_int(value: object, default: int = 0) -> int:
    """Safely convert a value to int."""
    if isinstance(value, int):
        return value
    if isinstance(value, float):
        return int(value)
    return default


@router.post("/social/reddit", response_model=RedditResponse)
async def get_reddit_data(
    request: RedditRequest,
    current_user: CurrentUser,
) -> RedditResponse:
    """
    Fetch Reddit data from a subreddit.

    Args:
        request: Reddit request parameters.
        current_user: Authenticated user from JWT.

    Returns:
        Reddit posts and extracted trends.
    """
    try:
        result = await fetch_subreddit_posts(
            subreddit=request.subreddit,
            sort=request.sort,
            limit=request.limit,
        )

        raw_posts = result.get("posts", [])
        posts_list = (
            cast(list[dict[str, object]], raw_posts)
            if isinstance(raw_posts, list)
            else []
        )

        posts = [
            RedditPost(
                title=str(post.get("title", "")),
                score=_safe_int(post.get("score", 0)),
                url=str(post.get("url", "")),
                num_comments=_safe_int(post.get("num_comments", 0)),
            )
            for post in posts_list
            if isinstance(post, dict)
        ]

        raw_trends = result.get("trends", [])
        trends = (
            [str(item) for item in raw_trends if isinstance(item, str)]
            if isinstance(raw_trends, list)
            else []
        )

        return RedditResponse(
            posts=posts,
            trends=trends,
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Reddit data: {str(e)}",
        )
