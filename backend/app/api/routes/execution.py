"""Workflow execution API routes."""

from fastapi import APIRouter, HTTPException, status

from app.api.deps import CurrentUser
from app.models.schemas import (
    WorkflowExecuteResponse,
    ExecutionStepResponse,
    ExecutionCancelResponse,
)
from app.models.enums import ExecutionStatus
from app.services.workflow_engine import WorkflowEngine


router = APIRouter(prefix="/api", tags=["execution"])


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
        result = await engine.execute_workflow(workflow_id, current_user["id"])

        return WorkflowExecuteResponse(
            execution_id=result["execution_id"],
            status=result["status"],
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

        return ExecutionCancelResponse(
            execution_id=result["execution_id"],
            status=ExecutionStatus.CANCELLED,
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
