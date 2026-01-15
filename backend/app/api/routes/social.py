"""Social media API routes."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.models.schemas import RedditRequest, RedditResponse, RedditPost
from app.services.reddit import fetch_subreddit_posts


router = APIRouter(prefix="/api", tags=["social"])


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

        posts = [
            RedditPost(
                title=post["title"],
                score=post["score"],
                url=post["url"],
                num_comments=post["num_comments"],
            )
            for post in result["posts"]
        ]

        return RedditResponse(
            posts=posts,
            trends=result["trends"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch Reddit data: {str(e)}",
        )
