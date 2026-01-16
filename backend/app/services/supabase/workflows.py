"""Workflow database operations."""

from typing import Optional

from supabase import Client


async def get_workflow_with_nodes_and_edges(
    client: Client, workflow_id: str, user_id: Optional[str] = None
) -> dict:
    """
    Fetch a workflow with its nodes and edges.

    Args:
        client: Supabase client instance.
        workflow_id: UUID of the workflow.
        user_id: Optional user ID to enforce ownership.

    Returns:
        Dictionary containing workflow, nodes, and edges.
    """
    workflow_query = client.table("workflows").select("*").eq("id", workflow_id)
    if user_id:
        workflow_query = workflow_query.eq("user_id", user_id)
    workflow = workflow_query.single().execute()

    if not workflow.data:
        raise ValueError("Workflow not found")

    nodes = client.table("nodes").select("*").eq("workflow_id", workflow_id).execute()
    edges = client.table("edges").select("*").eq("workflow_id", workflow_id).execute()

    return {
        "workflow": workflow.data,
        "nodes": nodes.data,
        "edges": edges.data,
    }
