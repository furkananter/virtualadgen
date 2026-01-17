"""Supabase database service."""

# Client
from .client import get_supabase_client, get_public_supabase_client

# Workflows
from .workflows import get_workflow_with_nodes_and_edges

# Executions
from .executions import (
    create_execution,
    update_execution_status,
    get_execution,
    get_execution_for_user,
)

# Node executions
from .node_executions import (
    create_node_executions,
    update_node_execution,
    get_node_executions,
)

# Generations
from .generations import create_generation

# Storage
from .storage import upload_image_from_url, upload_images_from_urls

__all__ = [
    # Client
    "get_supabase_client",
    "get_public_supabase_client",
    # Workflows
    "get_workflow_with_nodes_and_edges",
    # Executions
    "create_execution",
    "update_execution_status",
    "get_execution",
    "get_execution_for_user",
    # Node executions
    "create_node_executions",
    "update_node_execution",
    "get_node_executions",
    # Generations
    "create_generation",
    # Storage
    "upload_image_from_url",
    "upload_images_from_urls",
]
