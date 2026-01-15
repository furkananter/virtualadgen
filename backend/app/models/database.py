"""Database model types for type hints."""

from typing import TypedDict, Optional
from datetime import datetime


class User(TypedDict):
    """User database record."""

    id: str
    email: str
    name: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime


class Workflow(TypedDict):
    """Workflow database record."""

    id: str
    user_id: str
    name: str
    description: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime


class Node(TypedDict):
    """Node database record."""

    id: str
    workflow_id: str
    type: str
    name: str
    config: dict
    position_x: float
    position_y: float
    has_breakpoint: bool
    created_at: datetime
    updated_at: datetime


class Edge(TypedDict):
    """Edge database record."""

    id: str
    workflow_id: str
    source_node_id: str
    target_node_id: str
    source_handle: Optional[str]
    target_handle: Optional[str]
    created_at: datetime


class Execution(TypedDict):
    """Execution database record."""

    id: str
    workflow_id: str
    status: str
    total_cost: Optional[float]
    error_message: Optional[str]
    started_at: datetime
    finished_at: Optional[datetime]


class NodeExecution(TypedDict):
    """Node execution database record."""

    id: str
    execution_id: str
    node_id: str
    status: str
    input_data: Optional[dict]
    output_data: Optional[dict]
    error_message: Optional[str]
    started_at: Optional[datetime]
    finished_at: Optional[datetime]


class Generation(TypedDict):
    """Generation database record."""

    id: str
    execution_id: str
    model_id: str
    prompt: str
    parameters: dict
    image_urls: list[str]
    aspect_ratio: str
    cost: Optional[float]
    created_at: datetime
