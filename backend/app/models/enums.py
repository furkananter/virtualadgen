"""Enumeration types for the application."""

from enum import Enum


class NodeType(str, Enum):
    """Types of nodes available in the workflow."""

    TEXT_INPUT = "TEXT_INPUT"
    IMAGE_INPUT = "IMAGE_INPUT"
    SOCIAL_MEDIA = "SOCIAL_MEDIA"
    PROMPT = "PROMPT"
    IMAGE_MODEL = "IMAGE_MODEL"
    OUTPUT = "OUTPUT"


class ExecutionStatus(str, Enum):
    """Status of a workflow execution."""

    PENDING = "PENDING"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class NodeExecutionStatus(str, Enum):
    """Status of a single node execution."""

    PENDING = "PENDING"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
