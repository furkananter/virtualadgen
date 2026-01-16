"""Supabase client and database operations."""

from typing import Any, Optional
from supabase import create_client, Client

from app.config import settings
from app.models.enums import ExecutionStatus, NodeExecutionStatus


def get_supabase_client() -> Client:
    """
    Create and return a Supabase client with service role key.

    Returns:
        Supabase client instance.
    """
    return create_client(settings.supabase_url, settings.supabase_secret_api_key)


def get_public_supabase_client() -> Client:
    """
    Create and return a Supabase client with publishable key.

    Returns:
        Supabase client instance for public operations.
    """
    return create_client(settings.supabase_url, settings.supabase_publishable_key)


async def get_workflow_with_nodes_and_edges(
    client: Client, workflow_id: str, user_id: Optional[str] = None
) -> dict[str, Any]:
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


async def create_execution(client: Client, workflow_id: str) -> dict[str, Any]:
    """
    Create a new execution record.

    Args:
        client: Supabase client instance.
        workflow_id: UUID of the workflow.

    Returns:
        Created execution record.
    """
    result = client.table("executions").insert({
        "workflow_id": workflow_id,
        "status": ExecutionStatus.RUNNING.value,
    }).execute()
    return result.data[0]


async def create_node_executions(
    client: Client, execution_id: str, node_ids: list[str]
) -> list[dict[str, Any]]:
    """
    Create node execution records for all nodes in a workflow.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.
        node_ids: List of node UUIDs.

    Returns:
        List of created node execution records.
    """
    records = [
        {"execution_id": execution_id, "node_id": node_id, "status": NodeExecutionStatus.PENDING.value}
        for node_id in node_ids
    ]
    result = client.table("node_executions").insert(records).execute()
    return result.data


async def update_execution_status(
    client: Client,
    execution_id: str,
    status: ExecutionStatus,
    error_message: Optional[str] = None,
    total_cost: Optional[float] = None,
) -> dict[str, Any]:
    """
    Update an execution's status.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.
        status: New execution status.
        error_message: Optional error message.
        total_cost: Optional total cost.

    Returns:
        Updated execution record.
    """
    update_data: dict[str, Any] = {"status": status.value}
    if error_message:
        update_data["error_message"] = error_message
    if total_cost is not None:
        update_data["total_cost"] = total_cost
    if status in (ExecutionStatus.COMPLETED, ExecutionStatus.FAILED, ExecutionStatus.CANCELLED):
        update_data["finished_at"] = "now()"

    result = client.table("executions").update(update_data).eq("id", execution_id).execute()
    return result.data[0]


async def update_node_execution(
    client: Client,
    execution_id: str,
    node_id: str,
    status: NodeExecutionStatus,
    input_data: Optional[dict] = None,
    output_data: Optional[dict] = None,
    error_message: Optional[str] = None,
) -> dict[str, Any]:
    """
    Update a node execution's status and data.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.
        node_id: UUID of the node.
        status: New node execution status.
        input_data: Optional input data.
        output_data: Optional output data.
        error_message: Optional error message.

    Returns:
        Updated node execution record.
    """
    update_data: dict[str, Any] = {"status": status.value}
    if input_data is not None:
        update_data["input_data"] = input_data
    if output_data is not None:
        update_data["output_data"] = output_data
    if error_message:
        update_data["error_message"] = error_message
    if status == NodeExecutionStatus.RUNNING:
        update_data["started_at"] = "now()"
    if status in (NodeExecutionStatus.COMPLETED, NodeExecutionStatus.FAILED):
        update_data["finished_at"] = "now()"

    result = (
        client.table("node_executions")
        .update(update_data)
        .eq("execution_id", execution_id)
        .eq("node_id", node_id)
        .execute()
    )
    return result.data[0]


async def get_execution(client: Client, execution_id: str) -> dict[str, Any]:
    """
    Fetch an execution by ID.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.

    Returns:
        Execution record.
    """
    result = client.table("executions").select("*").eq("id", execution_id).single().execute()
    return result.data


async def get_execution_for_user(
    client: Client, execution_id: str, user_id: str
) -> dict[str, Any]:
    """
    Fetch an execution by ID and verify ownership via workflow.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.
        user_id: UUID of the authenticated user.

    Returns:
        Execution record.
    """
    execution = client.table("executions").select("*").eq("id", execution_id).single().execute()
    if not execution.data:
        raise ValueError("Execution not found")

    workflow = (
        client.table("workflows")
        .select("user_id")
        .eq("id", execution.data["workflow_id"])
        .single()
        .execute()
    )

    if not workflow.data or workflow.data.get("user_id") != user_id:
        raise ValueError("Execution not found")

    return execution.data


async def get_node_executions(client: Client, execution_id: str) -> list[dict[str, Any]]:
    """
    Fetch all node executions for an execution.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.

    Returns:
        List of node execution records.
    """
    result = client.table("node_executions").select("*").eq("execution_id", execution_id).execute()
    return result.data


async def create_generation(
    client: Client,
    execution_id: str,
    model_id: str,
    prompt: str,
    parameters: dict,
    image_urls: list[str],
    aspect_ratio: str,
    cost: float,
) -> dict[str, Any]:
    """
    Create a generation record.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.
        model_id: FAL AI model ID.
        prompt: Generation prompt.
        parameters: Generation parameters.
        image_urls: List of generated image URLs.
        aspect_ratio: Image aspect ratio.
        cost: Generation cost.

    Returns:
        Created generation record.
    """
    result = client.table("generations").insert({
        "execution_id": execution_id,
        "model_id": model_id,
        "prompt": prompt,
        "parameters": parameters,
        "image_urls": image_urls,
        "aspect_ratio": aspect_ratio,
        "cost": cost,
    }).execute()
    return result.data[0]
