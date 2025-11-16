import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import cytoscape, { Core } from 'cytoscape';
import { useObjects, useTags } from '@/lib/query';
import type { MNoteObject, Tag } from '@/lib/types';

interface GraphViewProps {
  wsId: string;
}

export function GraphView({ wsId }: GraphViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const navigate = useNavigate();

  const { data: objectsData } = useObjects({ wsId });
  const { data: tagsData } = useTags();

  const objects = objectsData?.items || [];
  const entityTags = (tagsData?.items || []).filter((t) => t.kind === 'entity');

  useEffect(() => {
    if (!containerRef.current || objects.length === 0) return;

    // Build graph data
    const elements: cytoscape.ElementDefinition[] = [];

    // Add object nodes
    for (const obj of objects) {
      elements.push({
        data: {
          id: obj.id,
          label: obj.title,
          type: obj.type,
          icon: obj.icon || '📄',
        },
        classes: 'object-node',
      });
    }

    // Add entity tag nodes
    for (const tag of entityTags) {
      elements.push({
        data: {
          id: tag.id,
          label: tag.label,
          type: 'tag',
        },
        classes: 'tag-node',
      });
    }

    // Add edges from relations
    for (const obj of objects) {
      if (obj.relations) {
        for (const rel of obj.relations) {
          elements.push({
            data: {
              id: `${obj.id}-${rel.toId}`,
              source: obj.id,
              target: rel.toId,
              label: rel.label || '',
            },
          });
        }
      }
    }

    // Initialize Cytoscape
    cyRef.current = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#7C5DF8',
            label: 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            color: '#fff',
            'font-size': '12px',
            width: 60,
            height: 60,
          },
        },
        {
          selector: '.tag-node',
          style: {
            'background-color': '#10b981',
            shape: 'diamond',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 2,
            'line-color': '#cbd5e1',
            'target-arrow-color': '#cbd5e1',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': '10px',
            color: '#94a3b8',
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: true,
        animationDuration: 500,
        nodeRepulsion: 8000,
        idealEdgeLength: 100,
      },
    });

    // Handle node clicks
    cyRef.current.on('tap', 'node', (evt) => {
      const nodeData = evt.target.data();
      if (nodeData.type !== 'tag') {
        navigate(`/w/${wsId}/object/${nodeData.id}`);
      }
    });

    return () => {
      cyRef.current?.destroy();
    };
  }, [objects, entityTags, navigate, wsId]);

  return <div ref={containerRef} className="w-full h-full bg-card rounded-lg" />;
}

