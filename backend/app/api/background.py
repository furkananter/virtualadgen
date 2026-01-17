"""Background task utilities for async execution handling."""

import asyncio
import logging
import traceback

from app.models.enums import ExecutionStatus
from app.services.supabase import get_supabase_client, update_execution_status

logger = logging.getLogger(__name__)


async def update_status_safe(
    execution_id: str,
    status: ExecutionStatus,
    error_message: str | None = None,
) -> None:
    """Update execution status without raising exceptions."""
    try:
        client = get_supabase_client()
        await update_execution_status(
            client, execution_id, status, error_message=error_message
        )
    except Exception:
        logger.exception("Failed to update execution %s status", execution_id)


def handle_task_completion(task: asyncio.Task, execution_id: str) -> None:
    """Callback for background task completion. Handles failures gracefully."""
    try:
        exception = task.exception()
        if exception:
            tb = "".join(
                traceback.format_exception(
                    type(exception), exception, exception.__traceback__
                )
            )
            asyncio.create_task(
                update_status_safe(
                    execution_id, ExecutionStatus.FAILED, f"{exception}\n{tb}"
                )
            )
    except asyncio.CancelledError:
        asyncio.create_task(update_status_safe(execution_id, ExecutionStatus.CANCELLED))


def create_background_task(coro, execution_id: str) -> asyncio.Task:
    """Create a background task with automatic completion handling."""
    task = asyncio.create_task(coro)
    task.add_done_callback(lambda t: handle_task_completion(t, execution_id))
    return task
