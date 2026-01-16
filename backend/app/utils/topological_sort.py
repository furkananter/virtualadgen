"""Topological sorting for workflow nodes."""

from collections import defaultdict, deque
from typing import Any


def topological_sort(nodes: list[dict[str, Any]], edges: list[dict[str, Any]]) -> list[str]:
    """
    Perform topological sort on workflow nodes based on edges.

    Only includes nodes that are connected to an OUTPUT node (directly or indirectly).
    Uses reverse traversal from OUTPUT nodes to find all reachable nodes,
    then applies Kahn's algorithm for execution order.

    Args:
        nodes: List of node dictionaries with 'id' and 'type' fields.
        edges: List of edge dictionaries with 'source_node_id' and 'target_node_id'.

    Returns:
        List of node IDs in topologically sorted order.

    Raises:
        ValueError: If the graph contains a cycle or no OUTPUT node is found.
    """
    node_map = {node["id"]: node for node in nodes}
    node_ids = set(node_map.keys())
    
    # Build reverse adjacency (target -> sources)
    reverse_adj: dict[str, list[str]] = defaultdict(list)
    forward_adj: dict[str, list[str]] = defaultdict(list)
    
    for edge in edges:
        source = edge["source_node_id"]
        target = edge["target_node_id"]
        if source in node_ids and target in node_ids:
            reverse_adj[target].append(source)
            forward_adj[source].append(target)
    
    # Find OUTPUT nodes
    output_nodes = [
        node["id"] for node in nodes 
        if node.get("type") == "OUTPUT"
    ]
    
    if not output_nodes:
        raise ValueError("Workflow must have at least one OUTPUT node")
    
    # BFS backwards from OUTPUT nodes to find all connected nodes
    connected_nodes: set[str] = set()
    queue = deque(output_nodes)
    
    while queue:
        current = queue.popleft()
        if current in connected_nodes:
            continue
        connected_nodes.add(current)
        for source in reverse_adj[current]:
            if source not in connected_nodes:
                queue.append(source)
    
    if not connected_nodes:
        raise ValueError("No nodes connected to OUTPUT")
    
    # Now do topological sort only on connected nodes
    in_degree: dict[str, int] = {node_id: 0 for node_id in connected_nodes}
    
    for edge in edges:
        source = edge["source_node_id"]
        target = edge["target_node_id"]
        if source in connected_nodes and target in connected_nodes:
            in_degree[target] += 1
    
    sort_queue = deque([nid for nid, deg in in_degree.items() if deg == 0])
    sorted_nodes: list[str] = []
    
    while sort_queue:
        current = sort_queue.popleft()
        sorted_nodes.append(current)
        
        for neighbor in forward_adj[current]:
            if neighbor in connected_nodes:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    sort_queue.append(neighbor)
    
    if len(sorted_nodes) != len(connected_nodes):
        raise ValueError("Workflow contains a cycle and cannot be executed")
    
    return sorted_nodes
