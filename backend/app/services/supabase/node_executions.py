"""Node execution database operations."""

from typing import Optional

from supabase import Client

from app.models.enums import NodeExecutionStatus


async def create_node_executions(
    client: Client, execution_id: str, node_ids: list[str]
) -> list[dict]:
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
        {
            "execution_id": execution_id,
            "node_id": node_id,
            "status": NodeExecutionStatus.PENDING.value,
        }
        for node_id in node_ids
    ]
    result = client.table("node_executions").insert(records).execute()
    return result.data


async def update_node_execution(
    client: Client,
    execution_id: str,
    node_id: str,
    status: NodeExecutionStatus,
    input_data: Optional[dict] = None,
    output_data: Optional[dict] = None,
    error_message: Optional[str] = None,
) -> dict:
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
    update_data: dict = {"status": status.value}

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


async def get_node_executions(client: Client, execution_id: str) -> list[dict]:
    """
    Fetch all node executions for an execution.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.

    Returns:
        List of node execution records.
    """
    result = (
        client.table("node_executions")
        .select("*")
        .eq("execution_id", execution_id)
        .execute()
    )
    return result.data
