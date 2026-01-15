"""Topological sorting for workflow nodes."""

from collections import defaultdict, deque
from typing import Any


def topological_sort(nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> list[str]:
    """
    Perform topological sort on workflow nodes based on edges.

    Uses Kahn's algorithm to determine execution order.
    Nodes at the same level (no dependencies between them) are grouped together.

    Args:
        nodes: List of node dictionaries with 'id' field.
        edges: List of edge dictionaries with 'source_node_id' and 'target_node_id'.

    Returns:
        List of node IDs in topologically sorted order.

    Raises:
        ValueError: If the graph contains a cycle.
    """
    node_ids = {node["id"] for node in nodes}
    in_degree: dict[str, int] = {node_id: 0 for node_id in node_ids}
    adjacency: dict[str, list[str]] = defaultdict(list)

    for edge in edges:
        source = edge["source_node_id"]
        target = edge["target_node_id"]
        if source in node_ids and target in node_ids:
            adjacency[source].append(target)
            in_degree[target] += 1

    queue = deque([node_id for node_id, degree in in_degree.items() if degree == 0])
    sorted_nodes: list[str] = []

    while queue:
        current = queue.popleft()
        sorted_nodes.append(current)

        for neighbor in adjacency[current]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(sorted_nodes) != len(node_ids):
        raise ValueError("Workflow contains a cycle and cannot be executed")

    return sorted_nodes
