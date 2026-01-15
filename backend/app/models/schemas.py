"""Pydantic schemas for API requests and responses."""

from typing import Optional
from pydantic import BaseModel

from .enums import ExecutionStatus


class WorkflowExecuteResponse(BaseModel):
    """Response for workflow execution start."""

    execution_id: str
    status: ExecutionStatus


class ExecutionStepResponse(BaseModel):
    """Response for stepping through execution."""

    execution_id: str
    status: ExecutionStatus
    current_node_id: Optional[str] = None


class ExecutionCancelResponse(BaseModel):
    """Response for execution cancellation."""

    execution_id: str
    status: ExecutionStatus


class RedditRequest(BaseModel):
    """Request for Reddit data fetch."""

    subreddit: str
    sort: str = "hot"
    limit: int = 10


class RedditPost(BaseModel):
    """A single Reddit post."""

    title: str
    score: int
    url: str
    num_comments: int


class RedditResponse(BaseModel):
    """Response containing Reddit data."""

    posts: list[RedditPost]
    trends: list[str]
