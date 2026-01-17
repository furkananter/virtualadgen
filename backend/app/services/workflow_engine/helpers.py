"""Node execution helpers - graph traversal and node execution utilities."""

from app.models.enums import NodeType, NodeExecutionStatus
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


def gather_inputs(node_id: str, edges: list[dict], outputs: dict) -> dict:
    """
    Gather inputs from connected source nodes.

    Args:
        node_id: Target node ID.
        edges: List of edge records.
        outputs: Dictionary of node outputs.

    Returns:
        Dictionary of inputs keyed by source node ID.
    """
    inputs: dict = {}
    for edge in edges:
        if edge["target_node_id"] == node_id:
            source_id = edge["source_node_id"]
            if source_id in outputs:
                inputs[source_id] = outputs[source_id]
    return inputs


async def execute_node(node: dict, inputs: dict, context: dict) -> dict:
    """
    Execute a single node using its registered executor.

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


def find_paused_node_index(
    node_executions: list[dict], sorted_node_ids: list[str]
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
        ne["node_id"]
        for ne in node_executions
        if ne["status"] == NodeExecutionStatus.PAUSED.value
    }
    for idx, node_id in enumerate(sorted_node_ids):
        if node_id in paused_nodes:
            return idx
    return None


def get_output_config(
    image_node_id: str, nodes: list[dict], edges: list[dict]
) -> dict | None:
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


def load_previous_outputs(node_executions: list[dict]) -> tuple[dict, float]:
    """
    Load outputs from previously executed nodes.

    Args:
        node_executions: List of node execution records.

    Returns:
        Tuple of (outputs dict, total_cost).
    """
    outputs: dict = {}
    total_cost = 0.0
    for ne in node_executions:
        if ne["output_data"]:
            outputs[ne["node_id"]] = ne["output_data"]
            if "cost" in ne["output_data"]:
                total_cost += ne["output_data"]["cost"]
    return outputs, total_cost


async def run_single_node(
    client,
    execution_id: str,
    user_id: str,
    node: dict,
    edges: list[dict],
    nodes: list[dict],
    outputs: dict,
) -> dict:
    """
    Execute a single node with proper status updates.

    Args:
        client: Supabase client instance.
        execution_id: UUID of the execution.
        user_id: UUID of the authenticated user.
        node: Node record to execute.
        edges: List of edge records.
        nodes: List of all node records.
        outputs: Dictionary of previous node outputs.

    Returns:
        Node execution output.
    """
    from app.services.supabase import update_node_execution
    from app.models.enums import NodeExecutionStatus

    node_id = node["id"]
    inputs = gather_inputs(node_id, edges, outputs)

    await update_node_execution(
        client,
        execution_id,
        node_id,
        NodeExecutionStatus.RUNNING,
        input_data=inputs,
    )

    context: dict = {"execution_id": execution_id, "user_id": user_id}
    if node.get("type") == NodeType.IMAGE_MODEL.value:
        output_config = get_output_config(node_id, nodes, edges)
        if output_config:
            context["output_config"] = output_config

    try:
        output = await execute_node(node, inputs, context)
    except Exception as e:
        await update_node_execution(
            client,
            execution_id,
            node_id,
            NodeExecutionStatus.FAILED,
            error_message=str(e),
        )
        raise

    await update_node_execution(
        client,
        execution_id,
        node_id,
        NodeExecutionStatus.COMPLETED,
        output_data=output,
    )

    return output
