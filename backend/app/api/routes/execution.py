"""Workflow execution API routes."""

import asyncio
import logging
import traceback
from fastapi import APIRouter, HTTPException, status

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


async def _update_execution_status_safe(
    execution_id: str,
    status: ExecutionStatus,
    error_message: str | None = None,
) -> None:
    """Safely update execution status, suppressing any errors."""
    try:
        client = get_supabase_client()
        await update_execution_status(
            client, execution_id, status, error_message=error_message
        )
    except Exception as e:
        logger.error(
            f"Failed to update execution {execution_id} status to {status}: {e}"
        )


def _handle_task_exception(task: asyncio.Task, execution_id: str) -> None:
    """Handle uncaught exceptions from background tasks."""
    try:
        exc = task.exception()
        if exc:
            tb = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
            error_msg = f"{type(exc).__name__}: {exc}\n{tb}"
            logger.error(f"Background execution {execution_id} failed: {exc}")
            asyncio.create_task(
                _update_execution_status_safe(
                    execution_id, ExecutionStatus.FAILED, error_msg
                )
            )
    except asyncio.CancelledError:
        logger.warning(f"Background execution {execution_id} was cancelled")
        asyncio.create_task(
            _update_execution_status_safe(execution_id, ExecutionStatus.CANCELLED)
        )


@router.post(
    "/workflows/{workflow_id}/execute",
    response_model=WorkflowExecuteResponse,
)
async def execute_workflow(
    workflow_id: str,
    current_user: CurrentUser,
) -> WorkflowExecuteResponse:
    """
    Start executing a workflow.

    Args:
        workflow_id: UUID of the workflow to execute.
        current_user: Authenticated user from JWT.

    Returns:
        Execution ID and initial status.
    """
    try:
        engine = WorkflowEngine()
        prepared = await engine.prepare_execution(workflow_id, current_user["id"])

        task = asyncio.create_task(
            engine._run_execution_background(
                prepared["execution_id"],
                prepared["nodes"],
                prepared["edges"],
                prepared["sorted_node_ids"],
            )
        )
        task.add_done_callback(
            lambda t: _handle_task_exception(t, prepared["execution_id"])
        )

        return WorkflowExecuteResponse(
            execution_id=prepared["execution_id"],
            status=prepared["status"],
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Workflow execution failed: {str(e)}",
        )


@router.post(
    "/executions/{execution_id}/step",
    response_model=ExecutionStepResponse,
)
async def step_execution(
    execution_id: str,
    current_user: CurrentUser,
) -> ExecutionStepResponse:
    """
    Continue execution from a breakpoint.

    Args:
        execution_id: UUID of the paused execution.
        current_user: Authenticated user from JWT.

    Returns:
        Updated execution status and current node ID.
    """
    try:
        engine = WorkflowEngine()
        result = await engine.step_execution(execution_id, current_user["id"])

        return ExecutionStepResponse(
            execution_id=result["execution_id"],
            status=result["status"],
            current_node_id=result.get("current_node_id"),
            error_message=result.get("error_message"),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Step execution failed: {str(e)}",
        )


@router.post(
    "/executions/{execution_id}/cancel",
    response_model=ExecutionCancelResponse,
)
async def cancel_execution(
    execution_id: str,
    current_user: CurrentUser,
) -> ExecutionCancelResponse:
    """
    Cancel a running or paused execution.

    Args:
        execution_id: UUID of the execution to cancel.
        current_user: Authenticated user from JWT.

    Returns:
        Cancelled execution status.
    """
    try:
        engine = WorkflowEngine()
        result = await engine.cancel_execution(execution_id, current_user["id"])

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
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cancel execution failed: {str(e)}",
        )
