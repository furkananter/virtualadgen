"""
Workflow execution API routes.

Provides endpoints for:
- Starting workflow execution
- Stepping through breakpoints
- Cancelling executions
"""

import asyncio
import logging
import traceback
from functools import wraps
from typing import Callable, TypeVar

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUser
from app.models.schemas import (
    WorkflowExecuteResponse,
    ExecutionStepResponse,
    ExecutionCancelResponse,
)
from app.models.enums import ExecutionStatus
from app.services.workflow_engine import WorkflowEngine
from app.services.supabase import get_supabase_client, update_execution_status

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["execution"])

T = TypeVar("T")


# =============================================================================
# Dependencies
# =============================================================================


def get_workflow_engine() -> WorkflowEngine:
    """Dependency injection for WorkflowEngine. Enables easy mocking in tests."""
    return WorkflowEngine()


# =============================================================================
# Error Handling
# =============================================================================


def handle_errors(operation: str) -> Callable:
    """
    Decorator for standardized error handling.

    - ValueError -> 404 Not Found
    - Exception -> 500 Internal Server Error
    """

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> T:
            try:
                return await func(*args, **kwargs)
            except ValueError as e:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=str(e),
                )
            except Exception as e:
                logger.exception(f"{operation} failed")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"{operation} failed: {str(e)}",
                )

        return wrapper

    return decorator


# =============================================================================
# Background Task Utilities
# =============================================================================


async def _update_status_safe(
    execution_id: str,
    new_status: ExecutionStatus,
    error_message: str | None = None,
) -> None:
    """Update execution status without raising exceptions."""
    try:
        client = get_supabase_client()
        await update_execution_status(
            client, execution_id, new_status, error_message=error_message
        )
    except Exception as e:
        logger.error(f"Failed to update execution {execution_id} status: {e}")


def _handle_background_task_completion(task: asyncio.Task, execution_id: str) -> None:
    """Callback for background task completion. Handles failures gracefully."""
    try:
        exception = task.exception()
        if exception:
            tb = "".join(
                traceback.format_exception(
                    type(exception), exception, exception.__traceback__
                )
            )
            logger.error(f"Background execution {execution_id} failed: {exception}")
            asyncio.create_task(
                _update_status_safe(
                    execution_id, ExecutionStatus.FAILED, f"{exception}\n{tb}"
                )
            )
    except asyncio.CancelledError:
        logger.warning(f"Background execution {execution_id} was cancelled")
        asyncio.create_task(
            _update_status_safe(execution_id, ExecutionStatus.CANCELLED)
        )


# =============================================================================
# Routes
# =============================================================================


@router.post("/workflows/{workflow_id}/execute", response_model=WorkflowExecuteResponse)
@handle_errors("Workflow execution")
async def execute_workflow(
    workflow_id: str,
    current_user: CurrentUser,
    engine: WorkflowEngine = Depends(get_workflow_engine),
) -> WorkflowExecuteResponse:
    """
    Start executing a workflow.

    Creates an execution record and starts background processing.
    Returns immediately with execution ID for status tracking.
    """
    prepared = await engine.prepare_execution(workflow_id, current_user["id"])

    # Start background execution
    task = asyncio.create_task(
        engine._run_execution_background(
            prepared["execution_id"],
            prepared["nodes"],
            prepared["edges"],
            prepared["sorted_node_ids"],
        )
    )
    task.add_done_callback(
        lambda t: _handle_background_task_completion(t, prepared["execution_id"])
    )

    return WorkflowExecuteResponse(
        execution_id=prepared["execution_id"],
        status=prepared["status"],
    )


@router.post("/executions/{execution_id}/step", response_model=ExecutionStepResponse)
@handle_errors("Step execution")
async def step_execution(
    execution_id: str,
    current_user: CurrentUser,
    engine: WorkflowEngine = Depends(get_workflow_engine),
) -> ExecutionStepResponse:
    """
    Continue execution from a breakpoint.

    Executes the current paused node and advances to the next breakpoint
    or completes the workflow.
    """
    result = await engine.step_execution(execution_id, current_user["id"])

    return ExecutionStepResponse(
        execution_id=result["execution_id"],
        status=result["status"],
        current_node_id=result.get("current_node_id"),
        error_message=result.get("error_message"),
    )


@router.post(
    "/executions/{execution_id}/cancel", response_model=ExecutionCancelResponse
)
@handle_errors("Cancel execution")
async def cancel_execution(
    execution_id: str,
    current_user: CurrentUser,
    engine: WorkflowEngine = Depends(get_workflow_engine),
) -> ExecutionCancelResponse:
    """
    Cancel a running or paused execution.

    Marks the execution as cancelled. The in-progress node will complete
    but no further nodes will be executed.
    """
    result = await engine.cancel_execution(execution_id, current_user["id"])

    # Normalize status to enum
    result_status = result.get("status", ExecutionStatus.CANCELLED)
    if isinstance(result_status, str):
        try:
            result_status = ExecutionStatus(result_status)
        except ValueError:
            result_status = ExecutionStatus.CANCELLED

    return ExecutionCancelResponse(
        execution_id=result["execution_id"],
        status=result_status,
    )
