"""Workflow execution engine - public API."""

from typing import cast

from supabase import Client

from app.models.enums import ExecutionStatus
from app.utils.topological_sort import topological_sort
from app.services.supabase import (
    get_supabase_client,
    get_workflow_with_nodes_and_edges,
    create_execution,
    create_node_executions,
    update_execution_status,
    get_execution_for_user,
    get_node_executions,
)
from .runner import ExecutionRunner
from .helpers import find_paused_node_index


class WorkflowEngine:
    """Engine for executing visual workflows."""

    def __init__(self) -> None:
        """Initialize the workflow engine."""
        self.client: Client = get_supabase_client()
        self.runner = ExecutionRunner(self.client)

    async def execute_workflow(self, workflow_id: str, user_id: str) -> dict:
        """
        Start executing a workflow.

        Args:
            workflow_id: UUID of the workflow to execute.
            user_id: UUID of the authenticated user.

        Returns:
            Dictionary with execution_id and status.
        """
        data = await get_workflow_with_nodes_and_edges(
            self.client, workflow_id, user_id=user_id
        )
        nodes = data["nodes"]
        edges = data["edges"]

        sorted_node_ids = topological_sort(nodes, edges)
        execution = await create_execution(self.client, workflow_id)
        execution_id = cast(str, execution["id"])
        # Pass sorted nodes to preserve node_type and node_name in execution history
        node_map = {node["id"]: node for node in nodes}
        sorted_nodes = [node_map[nid] for nid in sorted_node_ids]
        await create_node_executions(self.client, execution_id, sorted_nodes)

        return await self.runner.run(
            execution_id=execution_id,
            nodes=nodes,
            edges=edges,
            sorted_node_ids=sorted_node_ids,
            user_id=user_id,
        )

    async def prepare_execution(self, workflow_id: str, user_id: str) -> dict:
        """
        Prepare workflow execution without running it.

        Creates execution record and returns data needed for background execution.

        Args:
            workflow_id: UUID of the workflow to execute.
            user_id: UUID of the authenticated user.

        Returns:
            Dictionary with execution_id, status, nodes, edges, and sorted_node_ids.
        """
        data = await get_workflow_with_nodes_and_edges(
            self.client, workflow_id, user_id=user_id
        )
        nodes = data["nodes"]
        edges = data["edges"]

        sorted_node_ids = topological_sort(nodes, edges)
        execution = await create_execution(self.client, workflow_id)
        execution_id = cast(str, execution["id"])
        # Pass sorted nodes to preserve node_type and node_name in execution history
        node_map = {node["id"]: node for node in nodes}
        sorted_nodes = [node_map[nid] for nid in sorted_node_ids]
        await create_node_executions(self.client, execution_id, sorted_nodes)

        return {
            "execution_id": execution_id,
            # PENDING until background execution actually starts
            "status": ExecutionStatus.PENDING,
            "nodes": nodes,
            "edges": edges,
            "sorted_node_ids": sorted_node_ids,
            "user_id": user_id,
        }

    async def _run_execution_background(
        self,
        execution_id: str,
        nodes: list[dict],
        edges: list[dict],
        sorted_node_ids: list[str],
        user_id: str,
    ) -> dict:
        """
        Run workflow execution in background. Internal method.

        This is an internal method called only after authentication and
        authorization have been verified in the route layer. Do not call
        directly from untrusted contexts.

        Args:
            execution_id: UUID of the execution.
            nodes: List of node records.
            edges: List of edge records.
            sorted_node_ids: Topologically sorted node IDs.
            user_id: UUID of the authenticated user.

        Returns:
            Execution result with status.
        """
        return await self.runner.run(
            execution_id=execution_id,
            nodes=nodes,
            edges=edges,
            sorted_node_ids=sorted_node_ids,
            user_id=user_id,
        )

    async def step_execution(self, execution_id: str, user_id: str) -> dict:
        """
        Continue execution from a breakpoint.

        Args:
            execution_id: UUID of the paused execution.
            user_id: UUID of the authenticated user.

        Returns:
            Dictionary with execution_id, status, and current_node_id.
        """
        execution = await get_execution_for_user(self.client, execution_id, user_id)

        if execution["status"] != ExecutionStatus.PAUSED.value:
            return {
                "execution_id": execution_id,
                "status": ExecutionStatus(execution["status"]),
                "current_node_id": None,
            }

        workflow_id = cast(str, execution["workflow_id"])
        workflow_data = await get_workflow_with_nodes_and_edges(
            self.client, workflow_id, user_id=user_id
        )
        nodes = workflow_data["nodes"]
        edges = workflow_data["edges"]

        sorted_node_ids = topological_sort(nodes, edges)
        node_executions = await get_node_executions(self.client, execution_id)

        paused_idx = find_paused_node_index(node_executions, sorted_node_ids)
        if paused_idx is None:
            return {
                "execution_id": execution_id,
                "status": ExecutionStatus.COMPLETED,
                "current_node_id": None,
            }

        return await self.runner.step_single_node(
            execution_id=execution_id,
            nodes=nodes,
            edges=edges,
            sorted_node_ids=sorted_node_ids,
            user_id=user_id,
            start_index=paused_idx,
        )

    async def cancel_execution(self, execution_id: str, user_id: str) -> dict:
        """
        Cancel a running or paused execution.

        Args:
            execution_id: UUID of the execution to cancel.
            user_id: UUID of the authenticated user.

        Returns:
            Dictionary with execution_id and cancelled status.
        """
        await get_execution_for_user(self.client, execution_id, user_id)
        await update_execution_status(
            self.client, execution_id, ExecutionStatus.CANCELLED
        )
        return {
            "execution_id": execution_id,
            "status": ExecutionStatus.CANCELLED,
        }
