"""Execution database operations."""

from typing import Optional

from supabase import Client

from app.models.enums import ExecutionStatus


async def create_execution(client: Client, workflow_id: str) -> dict:
    """
    Create a new execution record.

    Args:
        client: Supabase client instance.
        workflow_id: UUID of the workflow.

    Returns:
        Created execution record.
    """
    result = (
        client.table("executions")
        .insert(
            {
                "workflow_id": workflow_id,
                "status": ExecutionStatus.RUNNING.value,
            }
        )
        .execute()
    )
    return result.data[0]


async def update_execution_status(
    client: Client,
    execution_id: str,
    status: ExecutionStatus,
    error_message: Optional[str] = None,
    total_cost: Optional[float] = None,
) -> dict:
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
    update_data: dict = {"status": status.value}

    if error_message:
        update_data["error_message"] = error_message
    if total_cost is not None:
        update_data["total_cost"] = total_cost
    if status in (
        ExecutionStatus.COMPLETED,
        ExecutionStatus.FAILED,
        ExecutionStatus.CANCELLED,
    ):
        update_data["finished_at"] = "now()"

    result = (
        client.table("executions").update(update_data).eq("id", execution_id).execute()
    )
    return result.data[0]


async def get_execution(client: Client, execution_id: str) -> dict:
    """
    Fetch an execution by ID.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.

    Returns:
        Execution record.
    """
    result = (
        client.table("executions").select("*").eq("id", execution_id).single().execute()
    )
    return result.data


async def get_execution_for_user(
    client: Client, execution_id: str, user_id: str
) -> dict:
    """
    Fetch an execution by ID and verify ownership via workflow.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.
        user_id: UUID of the authenticated user.

    Returns:
        Execution record.

    Raises:
        ValueError: If execution not found or user doesn't own it.
    """
    execution = (
        client.table("executions").select("*").eq("id", execution_id).single().execute()
    )
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
