"""Execution database operations."""

from datetime import datetime, timezone
from typing import Optional, Mapping, cast

from supabase import Client

from app.models.enums import ExecutionStatus


async def create_execution(client: Client, workflow_id: str) -> dict[str, object]:
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
    data = result.data
    if data and isinstance(data, list) and len(data) > 0:
        first_item = data[0]
        if isinstance(first_item, Mapping):
            return dict(first_item)
    raise ValueError(f"Failed to create execution for workflow_id={workflow_id}")


async def update_execution_status(
    client: Client,
    execution_id: str,
    status: ExecutionStatus,
    error_message: Optional[str] = None,
    total_cost: Optional[float] = None,
) -> dict[str, object]:
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
    update_payload: dict[str, str | float] = {"status": status.value}

    if error_message:
        update_payload["error_message"] = error_message
    if total_cost is not None:
        update_payload["total_cost"] = total_cost
    if status in (
        ExecutionStatus.COMPLETED,
        ExecutionStatus.FAILED,
        ExecutionStatus.CANCELLED,
    ):
        update_payload["finished_at"] = datetime.now(timezone.utc).isoformat()

    result = (
        client.table("executions")
        .update(update_payload)
        .eq("id", execution_id)
        .execute()
    )

    data = result.data
    if data and isinstance(data, list) and len(data) > 0:
        first_item = data[0]
        if isinstance(first_item, Mapping):
            return dict(first_item)
    raise ValueError(f"Execution not found: execution_id={execution_id}")


async def get_execution(client: Client, execution_id: str) -> dict[str, object]:
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
    data = result.data
    if data and isinstance(data, Mapping):
        return dict(data)
    return {}


async def get_execution_for_user(
    client: Client, execution_id: str, user_id: str
) -> dict[str, object]:
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
    exec_data = execution.data
    if not exec_data or not isinstance(exec_data, Mapping):
        raise ValueError("Execution not found")

    workflow_id = cast(str, exec_data.get("workflow_id", ""))
    workflow = (
        client.table("workflows")
        .select("user_id")
        .eq("id", workflow_id)
        .single()
        .execute()
    )

    wf_data = workflow.data
    if not wf_data or not isinstance(wf_data, Mapping):
        raise ValueError("Execution not found")

    if wf_data.get("user_id") != user_id:
        raise ValueError("Execution not found")

    return dict(exec_data)
