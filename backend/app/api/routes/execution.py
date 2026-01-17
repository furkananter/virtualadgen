"""
Workflow execution API routes.

Provides endpoints for:
- Starting workflow execution
- Stepping through breakpoints
- Cancelling executions
"""

import logging
from typing import cast

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import CurrentUser
from app.api.background import create_background_task
from app.models.schemas import (
    WorkflowExecuteResponse,
    ExecutionStepResponse,
    ExecutionCancelResponse,
)
from app.models.enums import ExecutionStatus
from app.services.workflow_engine import WorkflowEngine

logger = logging.getLogger(__name__)


router = APIRouter(prefix="/api", tags=["execution"])


def get_workflow_engine() -> WorkflowEngine:
    """Dependency injection for WorkflowEngine."""
    return WorkflowEngine()


@router.post("/workflows/{workflow_id}/execute", response_model=WorkflowExecuteResponse)
async def execute_workflow(
    workflow_id: str,
    current_user: CurrentUser,
    engine: WorkflowEngine = Depends(get_workflow_engine),
) -> WorkflowExecuteResponse:
    """Start executing a workflow."""
    try:
        user_id = cast(str, current_user["id"])
        prepared = await engine.prepare_execution(workflow_id, user_id)

        create_background_task(
            engine._run_execution_background(
                prepared["execution_id"],
                prepared["nodes"],
                prepared["edges"],
                prepared["sorted_node_ids"],
                prepared["user_id"],
            ),
            prepared["execution_id"],
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
    except HTTPException:
        raise
    except Exception:
        logger.exception("Workflow execution failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Workflow execution failed",
        )


@router.post("/executions/{execution_id}/step", response_model=ExecutionStepResponse)
async def step_execution(
    execution_id: str,
    current_user: CurrentUser,
    engine: WorkflowEngine = Depends(get_workflow_engine),
) -> ExecutionStepResponse:
    """Continue execution from a breakpoint."""
    try:
        user_id = cast(str, current_user["id"])
        result = await engine.step_execution(execution_id, user_id)

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
    except HTTPException:
        raise
    except Exception:
        logger.exception("Step execution failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Step execution failed",
        )


@router.post(
    "/executions/{execution_id}/cancel", response_model=ExecutionCancelResponse
)
async def cancel_execution(
    execution_id: str,
    current_user: CurrentUser,
    engine: WorkflowEngine = Depends(get_workflow_engine),
) -> ExecutionCancelResponse:
    """Cancel a running or paused execution."""
    try:
        user_id = cast(str, current_user["id"])
        result = await engine.cancel_execution(execution_id, user_id)

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
    except HTTPException:
        raise
    except Exception:
        logger.exception("Cancel execution failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Cancel execution failed",
        )
