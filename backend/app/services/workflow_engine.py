"""Workflow execution engine."""

from typing import Any

from supabase import Client

from app.models.enums import NodeType, ExecutionStatus, NodeExecutionStatus
from app.utils.topological_sort import topological_sort
from app.services.supabase import (
    get_supabase_client,
    get_workflow_with_nodes_and_edges,
    create_execution,
    create_node_executions,
    update_execution_status,
    update_node_execution,
    get_execution_for_user,
    get_node_executions,
)
from app.services.node_executors import (
    TextInputExecutor,
    ImageInputExecutor,
    SocialMediaExecutor,
    PromptExecutor,
    ImageModelExecutor,
    OutputExecutor,
)


EXECUTORS = {
    NodeType.TEXT_INPUT: TextInputExecutor(),
    NodeType.IMAGE_INPUT: ImageInputExecutor(),
    NodeType.SOCIAL_MEDIA: SocialMediaExecutor(),
    NodeType.PROMPT: PromptExecutor(),
    NodeType.IMAGE_MODEL: ImageModelExecutor(),
    NodeType.OUTPUT: OutputExecutor(),
}


class WorkflowEngine:
    """Engine for executing visual workflows."""

    def __init__(self) -> None:
        """Initialize the workflow engine."""
        self.client: Client = get_supabase_client()

    async def execute_workflow(self, workflow_id: str, user_id: str) -> dict[str, Any]:
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
        await create_node_executions(self.client, execution["id"], sorted_node_ids)

        return await self._run_execution(
            execution_id=execution["id"],
            nodes=nodes,
            edges=edges,
            sorted_node_ids=sorted_node_ids,
        )

    async def step_execution(self, execution_id: str, user_id: str) -> dict[str, Any]:
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

        workflow_data = await get_workflow_with_nodes_and_edges(
            self.client, execution["workflow_id"], user_id=user_id
        )
        nodes = workflow_data["nodes"]
        edges = workflow_data["edges"]

        sorted_node_ids = topological_sort(nodes, edges)
        node_executions = await get_node_executions(self.client, execution_id)

        paused_idx = self._find_paused_node_index(node_executions, sorted_node_ids)
        if paused_idx is None:
            return {
                "execution_id": execution_id,
                "status": ExecutionStatus.COMPLETED,
                "current_node_id": None,
            }

        return await self._step_single_node(
            execution_id=execution_id,
            nodes=nodes,
            edges=edges,
            sorted_node_ids=sorted_node_ids,
            start_index=paused_idx,
        )

    async def cancel_execution(self, execution_id: str, user_id: str) -> dict[str, Any]:
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

    async def _run_execution(
        self,
        execution_id: str,
        nodes: list[dict],
        edges: list[dict],
        sorted_node_ids: list[str],
        start_index: int = 0,
        pause_on_breakpoints: bool = True,
    ) -> dict[str, Any]:
        """
        Run the execution loop.

        Args:
            execution_id: UUID of the execution.
            nodes: List of node records.
            edges: List of edge records.
            sorted_node_ids: Topologically sorted node IDs.
            start_index: Index to start execution from.
            pause_on_breakpoints: Whether to pause before breakpoint nodes.

        Returns:
            Execution result with status.
        """
        node_map = {node["id"]: node for node in nodes}
        outputs: dict[str, dict[str, Any]] = {}
        total_cost = 0.0
        current_node_id = None

        node_executions = await get_node_executions(self.client, execution_id)
        for ne in node_executions:
            if ne["output_data"]:
                outputs[ne["node_id"]] = ne["output_data"]
                if "cost" in ne["output_data"]:
                    total_cost += ne["output_data"]["cost"]

        try:
            for idx in range(start_index, len(sorted_node_ids)):
                node_id = sorted_node_ids[idx]
                node = node_map[node_id]
                current_node_id = node_id

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

                inputs = self._gather_inputs(node_id, edges, outputs)

                await update_node_execution(
                    self.client, execution_id, node_id,
                    NodeExecutionStatus.RUNNING, input_data=inputs
                )

                context = {"execution_id": execution_id}
                if node.get("type") == NodeType.IMAGE_MODEL.value:
                    output_config = self._get_output_config(node_id, nodes, edges)
                    if output_config:
                        context["output_config"] = output_config

                output = await self._execute_node(
                    node=node,
                    inputs=inputs,
                    context=context,
                )
                outputs[node_id] = output

                if "cost" in output:
                    total_cost += output["cost"]

                await update_node_execution(
                    self.client, execution_id, node_id,
                    NodeExecutionStatus.COMPLETED, output_data=output
                )

            await update_execution_status(
                self.client, execution_id, ExecutionStatus.COMPLETED, total_cost=total_cost
            )
            return {
                "execution_id": execution_id,
                "status": ExecutionStatus.COMPLETED,
                "current_node_id": None,
            }

        except Exception as e:
            error_msg = str(e)
            if current_node_id:
                await update_node_execution(
                    self.client, execution_id, current_node_id,
                    NodeExecutionStatus.FAILED, error_message=error_msg
                )
            await update_execution_status(
                self.client, execution_id, ExecutionStatus.FAILED, error_message=error_msg
            )
            return {
                "execution_id": execution_id,
                "status": ExecutionStatus.FAILED,
                "current_node_id": current_node_id,
                "error_message": error_msg,
            }

    async def _step_single_node(
        self,
        execution_id: str,
        nodes: list[dict],
        edges: list[dict],
        sorted_node_ids: list[str],
        start_index: int,
    ) -> dict[str, Any]:
        """
        Execute a single node and pause at the next node.

        Args:
            execution_id: UUID of the execution.
            nodes: List of node records.
            edges: List of edge records.
            sorted_node_ids: Topologically sorted node IDs.
            start_index: Index of the paused node to execute.

        Returns:
            Execution result with updated status.
        """
        node_map = {node["id"]: node for node in nodes}
        outputs: dict[str, dict[str, Any]] = {}
        total_cost = 0.0

        node_executions = await get_node_executions(self.client, execution_id)
        for ne in node_executions:
            if ne["output_data"]:
                outputs[ne["node_id"]] = ne["output_data"]
                if "cost" in ne["output_data"]:
                    total_cost += ne["output_data"]["cost"]

        node_id = sorted_node_ids[start_index]
        node = node_map[node_id]

        try:
            await update_execution_status(self.client, execution_id, ExecutionStatus.RUNNING)

            inputs = self._gather_inputs(node_id, edges, outputs)
            await update_node_execution(
                self.client, execution_id, node_id,
                NodeExecutionStatus.RUNNING, input_data=inputs
            )

            context = {"execution_id": execution_id}
            if node.get("type") == NodeType.IMAGE_MODEL.value:
                output_config = self._get_output_config(node_id, nodes, edges)
                if output_config:
                    context["output_config"] = output_config

            output = await self._execute_node(
                node=node,
                inputs=inputs,
                context=context,
            )
            outputs[node_id] = output

            if "cost" in output:
                total_cost += output["cost"]

            await update_node_execution(
                self.client, execution_id, node_id,
                NodeExecutionStatus.COMPLETED, output_data=output
            )

            next_index = start_index + 1
            if next_index >= len(sorted_node_ids):
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
            error_msg = str(e)
            await update_node_execution(
                self.client, execution_id, node_id,
                NodeExecutionStatus.FAILED, error_message=error_msg
            )
            await update_execution_status(
                self.client, execution_id, ExecutionStatus.FAILED, error_message=error_msg
            )
            return {
                "execution_id": execution_id,
                "status": ExecutionStatus.FAILED,
                "current_node_id": node_id,
                "error_message": error_msg,
            }

    def _gather_inputs(
        self,
        node_id: str,
        edges: list[dict],
        outputs: dict[str, dict[str, Any]],
    ) -> dict[str, Any]:
        """
        Gather inputs from connected source nodes.

        Args:
            node_id: Target node ID.
            edges: List of edge records.
            outputs: Dictionary of node outputs.

        Returns:
            Dictionary of inputs keyed by source node ID.
        """
        inputs: dict[str, Any] = {}
        for edge in edges:
            if edge["target_node_id"] == node_id:
                source_id = edge["source_node_id"]
                if source_id in outputs:
                    inputs[source_id] = outputs[source_id]
        return inputs

    async def _execute_node(
        self,
        node: dict,
        inputs: dict[str, Any],
        context: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Execute a single node.

        Args:
            node: Node record from database.
            inputs: Gathered inputs from source nodes.
            context: Execution context.

        Returns:
            Node execution output.
        """
        node_type = NodeType(node["type"])
        executor = EXECUTORS.get(node_type)

        if not executor:
            raise ValueError(f"No executor for node type: {node_type}")

        config = node.get("config", {})
        return await executor.execute(inputs, config, context)

    def _find_paused_node_index(
        self,
        node_executions: list[dict],
        sorted_node_ids: list[str],
    ) -> int | None:
        """
        Find the index of the paused node in sorted order.

        Args:
            node_executions: List of node execution records.
            sorted_node_ids: Topologically sorted node IDs.

        Returns:
            Index of paused node or None if not found.
        """
        paused_nodes = {
            ne["node_id"] for ne in node_executions
            if ne["status"] == NodeExecutionStatus.PAUSED.value
        }
        for idx, node_id in enumerate(sorted_node_ids):
            if node_id in paused_nodes:
                return idx
        return None

    def _get_output_config(
        self,
        image_node_id: str,
        nodes: list[dict],
        edges: list[dict],
    ) -> dict[str, Any] | None:
        """
        Find output node configuration connected to an image model node.

        Args:
            image_node_id: Image model node ID.
            nodes: List of node records.
            edges: List of edge records.

        Returns:
            Output node config if found, otherwise None.
        """
        node_map = {node["id"]: node for node in nodes}
        for edge in edges:
            if edge["source_node_id"] == image_node_id:
                target_id = edge["target_node_id"]
                target_node = node_map.get(target_id)
                if target_node and target_node.get("type") == NodeType.OUTPUT.value:
                    return target_node.get("config", {})
        return None
