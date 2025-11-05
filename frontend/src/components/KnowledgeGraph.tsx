'use client';

import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';

interface GraphNode {
  id: string;
  title: string;
  type: string;
  tags?: string[];
}

interface GraphLink {
  sourceId: string;
  targetId: string;
  type: string;
}

interface KnowledgeGraphProps {
  data: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
}

const nodeColors: Record<string, string> = {
  law: '#3B82F6',        // blue
  policy: '#10B981',     // green
  regulation: '#F59E0B', // amber
  research: '#8B5CF6',   // purple
  default: '#6B7280',    // gray
};

export default function KnowledgeGraph({ data }: KnowledgeGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    // Convert data to ReactFlow format
    const flowNodes: Node[] = data.nodes.map((node, index) => {
      const angle = (index / data.nodes.length) * 2 * Math.PI;
      const radius = 250;
      
      return {
        id: node.id,
        type: 'default',
        data: { 
          label: (
            <div className="text-center">
              <div className="font-semibold text-sm">{node.title}</div>
              <div className="text-xs text-gray-500">{node.type}</div>
            </div>
          ),
          node: node,
        },
        position: {
          x: 400 + radius * Math.cos(angle),
          y: 300 + radius * Math.sin(angle),
        },
        style: {
          background: nodeColors[node.type] || nodeColors.default,
          color: 'white',
          border: '2px solid white',
          borderRadius: '8px',
          padding: '10px',
          width: 180,
          fontSize: '12px',
        },
      };
    });

    const flowEdges: Edge[] = data.links.map((link, index) => ({
      id: `e-${index}`,
      source: link.sourceId,
      target: link.targetId,
      type: 'smoothstep',
      animated: true,
      label: link.type,
      labelStyle: { fontSize: 10, fill: '#666' },
      labelBgStyle: { fill: '#fff' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      style: {
        strokeWidth: 2,
        stroke: '#94A3B8',
      },
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [data, setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onNodeClick = useCallback((_event: any, node: Node) => {
    setSelectedNode(node.data.node);
  }, []);

  return (
    <div className="w-full h-full bg-gray-50 rounded-lg relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
      >
        <Controls />
        <Background />
        
        <Panel position="top-left" className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-sm mb-2">กราฟความรู้ / Knowledge Graph</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: nodeColors.law }}></div>
              <span>กฎหมาย / Law</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: nodeColors.policy }}></div>
              <span>นโยบาย / Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: nodeColors.regulation }}></div>
              <span>ระเบียบ / Regulation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: nodeColors.research }}></div>
              <span>งานวิจัย / Research</span>
            </div>
          </div>
        </Panel>

        {selectedNode && (
          <Panel position="top-right" className="bg-white p-4 rounded-lg shadow-md max-w-xs">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-sm">รายละเอียด / Details</h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold">ชื่อ / Title:</span>
                <p className="text-gray-700">{selectedNode.title}</p>
              </div>
              <div>
                <span className="font-semibold">ประเภท / Type:</span>
                <p className="text-gray-700">{selectedNode.type}</p>
              </div>
              {selectedNode.tags && selectedNode.tags.length > 0 && (
                <div>
                  <span className="font-semibold">แท็ก / Tags:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedNode.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
