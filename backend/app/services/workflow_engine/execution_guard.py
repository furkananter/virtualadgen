"""Execution guard helpers."""

from supabase import Client

from app.models.enums import ExecutionStatus
from app.services.supabase import get_execution


async def is_execution_cancelled(client: Client, execution_id: str) -> bool:
    """Return True if execution has been cancelled."""
    execution = await get_execution(client, execution_id)
    return execution.get("status") == ExecutionStatus.CANCELLED.value
