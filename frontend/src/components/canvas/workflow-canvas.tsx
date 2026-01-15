import ReactFlow, { Background, Controls, Panel, useReactFlow, BackgroundVariant } from 'reactflow';
import type { Node } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvasStore } from '@/stores/canvas-store';
import { useExecutionStore } from '@/stores/execution-store';
import { useDebugStore } from '@/stores/debug-store';
import { useRealtime } from '@/hooks/use-realtime';
import { useNodeExecutionsQuery } from '@/lib/queries/use-node-executions-query';
import {
  TextInputNode,
  ImageInputNode,
  SocialMediaNode,
  PromptNode,
  ImageModelNode,
  OutputNode
} from '@/components/nodes';
import { useMemo, useRef, useCallback } from 'react';
import type { DragEvent } from 'react';
import { CanvasToolbar } from './canvas-toolbar';
import { NODE_CONFIGS } from './node-palette';
import type { NodeType } from '@/types/database';
import type { NodeData } from '@/types/nodes';

const nodeTypes = {
  TEXT_INPUT: TextInputNode,
  IMAGE_INPUT: ImageInputNode,
  SOCIAL_MEDIA: SocialMediaNode,
  PROMPT: PromptNode,
  IMAGE_MODEL: ImageModelNode,
  OUTPUT: OutputNode,
};

const getId = () => crypto.randomUUID();

export const WorkflowCanvas = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const { currentExecution } = useExecutionStore();
  const { nodeExecutions } = useDebugStore();

  // Realtime subscription for execution status
  useRealtime(currentExecution?.id || null);

  // Fetch node executions when execution exists (syncs to debug store)
  useNodeExecutionsQuery(currentExecution?.id || null);

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNodeId,
    setNodes
  } = useCanvasStore();

  // Merge execution status into nodes
  const nodesWithStatus = useMemo(() => {
    return nodes.map((node) => {
      const execution = nodeExecutions.get(node.id);
      return {
        ...node,
        data: {
          ...node.data,
          status: execution?.status,
          execution_error: execution?.error_message,
          execution_data: execution?.output_data,
        },
      };
    });
  }, [nodes, nodeExecutions]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;

      if (!type) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const nodeId = getId();
      const config = NODE_CONFIGS[type];

      const newNode: Node<NodeData> = {
        id: nodeId,
        type,
        position,
        data: {
          label: config?.label || type,
          config: {}
        },
        selected: true,
      };

      const updatedNodes = nodes.map((node) => ({
        ...node,
        selected: false,
      }));

      setNodes([...updatedNodes, newNode]);
      setSelectedNodeId(nodeId);
    },
    [project, nodes, setNodes, setSelectedNodeId]
  );

  const memoizedNodeTypes = useMemo(() => nodeTypes, []);

  return (
    <div className="h-full w-full bg-background transition-colors duration-500" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodesWithStatus}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={memoizedNodeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          className="opacity-20"
          color="currentColor"
        />
        <Controls
          showInteractive={false}
          className="bg-card/40! backdrop-blur-xl! border-border/40! shadow-2xl! rounded-2xl! overflow-hidden p-0.5! flex flex-col gap-0.5"
        />
        <Panel position="top-right">
          <CanvasToolbar />
        </Panel>
      </ReactFlow>
    </div>
  );
};
