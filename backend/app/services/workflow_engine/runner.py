"""Execution runner - handles the actual node execution loop."""

from supabase import Client

from app.models.enums import ExecutionStatus, NodeExecutionStatus
from app.services.supabase import (
    update_execution_status,
    update_node_execution,
    get_node_executions,
)
from .execution_guard import is_execution_cancelled
from .helpers import load_previous_outputs, run_single_node


class ExecutionRunner:
    """Handles the actual execution of workflow nodes."""

    def __init__(self, client: Client) -> None:
        self.client = client

    async def _maybe_cancel(self, execution_id: str) -> dict | None:
        """Check if execution was cancelled and return result if so."""
        if await is_execution_cancelled(self.client, execution_id):
            return {
                "execution_id": execution_id,
                "status": ExecutionStatus.CANCELLED,
                "current_node_id": None,
            }
        return None

    async def run(
        self,
        execution_id: str,
        nodes: list[dict],
        edges: list[dict],
        sorted_node_ids: list[str],
        user_id: str,
        start_index: int = 0,
        pause_on_breakpoints: bool = True,
    ) -> dict:
        """Run the execution loop through all nodes."""
        node_map = {node["id"]: node for node in nodes}
        node_executions = await get_node_executions(self.client, execution_id)
        outputs, total_cost = load_previous_outputs(node_executions)
        current_node_id = None

        try:
            for idx in range(start_index, len(sorted_node_ids)):
                if cancelled := await self._maybe_cancel(execution_id):
                    return cancelled

                node_id = sorted_node_ids[idx]
                node = node_map[node_id]
                current_node_id = node_id

                # Check breakpoint
                if pause_on_breakpoints and node.get("has_breakpoint", False):
                    await update_node_execution(
                        self.client, execution_id, node_id, NodeExecutionStatus.PAUSED
                    )
                    await update_execution_status(
                        self.client, execution_id, ExecutionStatus.PAUSED
                    )
                    return {
                        "execution_id": execution_id,
                        "status": ExecutionStatus.PAUSED,
                        "current_node_id": node_id,
                    }

                # Execute node using shared helper
                output = await run_single_node(
                    self.client, execution_id, user_id, node, edges, nodes, outputs
                )
                outputs[node_id] = output

                if "cost" in output:
                    total_cost += output["cost"]

                if cancelled := await self._maybe_cancel(execution_id):
                    return cancelled

            # All nodes completed
            if cancelled := await self._maybe_cancel(execution_id):
                return cancelled

            await update_execution_status(
                self.client,
                execution_id,
                ExecutionStatus.COMPLETED,
                total_cost=total_cost,
            )
            return {
                "execution_id": execution_id,
                "status": ExecutionStatus.COMPLETED,
                "current_node_id": None,
            }

        except Exception as e:
            return await self._handle_failure(execution_id, current_node_id, str(e))

    async def step_single_node(
        self,
        execution_id: str,
        nodes: list[dict],
        edges: list[dict],
        sorted_node_ids: list[str],
        user_id: str,
        start_index: int,
    ) -> dict:
        """Execute a single node and pause at the next node."""
        node_map = {node["id"]: node for node in nodes}
        node_executions = await get_node_executions(self.client, execution_id)
        outputs, total_cost = load_previous_outputs(node_executions)

        node_id = sorted_node_ids[start_index]
        node = node_map[node_id]

        try:
            if cancelled := await self._maybe_cancel(execution_id):
                return cancelled

            await update_execution_status(
                self.client, execution_id, ExecutionStatus.RUNNING
            )

            # Execute node using shared helper
            output = await run_single_node(
                self.client, execution_id, user_id, node, edges, nodes, outputs
            )

            if "cost" in output:
                total_cost += output["cost"]

            if cancelled := await self._maybe_cancel(execution_id):
                return cancelled

            # Check if done
            next_index = start_index + 1
            if next_index >= len(sorted_node_ids):
                if cancelled := await self._maybe_cancel(execution_id):
                    return cancelled

                await update_execution_status(
                    self.client,
                    execution_id,
                    ExecutionStatus.COMPLETED,
                    total_cost=total_cost,
                )
                return {
                    "execution_id": execution_id,
                    "status": ExecutionStatus.COMPLETED,
                    "current_node_id": None,
                }

            # Pause at next node
            next_node_id = sorted_node_ids[next_index]
            await update_node_execution(
                self.client, execution_id, next_node_id, NodeExecutionStatus.PAUSED
            )
            await update_execution_status(
                self.client, execution_id, ExecutionStatus.PAUSED
            )

            return {
                "execution_id": execution_id,
                "status": ExecutionStatus.PAUSED,
                "current_node_id": next_node_id,
            }

        except Exception as e:
            return await self._handle_failure(execution_id, node_id, str(e))

    async def _handle_failure(
        self, execution_id: str, node_id: str | None, error_msg: str
    ) -> dict:
        """Handle execution failure - update status and return error result."""
        if node_id:
            await update_node_execution(
                self.client,
                execution_id,
                node_id,
                NodeExecutionStatus.FAILED,
                error_message=error_msg,
            )
        await update_execution_status(
            self.client,
            execution_id,
            ExecutionStatus.FAILED,
            error_message=error_msg,
        )
        return {
            "execution_id": execution_id,
            "status": ExecutionStatus.FAILED,
            "current_node_id": node_id,
            "error_message": error_msg,
        }
