import { useRef, useState } from 'react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { GraphView } from './GraphView';
import { Legend } from './Legend';
import { GraphNode, GraphSettings } from './Types';
import { SettingsPanel } from './SettingsPanel';
import { useGraph } from './useGraph';
import { ForceGraphMethods, NodeObject } from 'react-force-graph-2d';
import { DetailsPopup } from './DetailsPopup';

export const KnowledgeGraph = () => {

  const graph = useGraph();

  const fg = useRef<ForceGraphMethods>();

  const [selectedNodes, setSelectedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const [settings, setSettings] = useState<GraphSettings>({});

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page graph relative">
        <div className="absolute top-4 left-6 z-10">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            <span className="bg-white/80 backdrop-blur-sm rounded px-1 py-0.5">
              Knowledge Graph
            </span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-6">
            <span className="bg-white/80 backdrop-blur-sm box-decoration-clone px-1 py-0.5 rounded">
              Explore connections between images and entities. Zoom and pan the graph with your mouse.
              Grab and pull a node to re-arrange the graph. Click a node to see more information.
            </span>
          </p>
        </div>

        <GraphView 
          ref={fg}
          graph={graph}
          settings={settings}
          selected={selectedNodes}
          onSelect={node => node ? setSelectedNodes([node]) : setSelectedNodes([])}
          onUpdateViewport={() => setSelectedNodes(sel => sel ? [...sel] : sel)} />

        <SettingsPanel 
          settings={settings}
          onChangeSettings={setSettings} />

        <Legend />

        {/* selectedNodes.length > 0 && (
          <SelectionDetails
            graph={graph}
            selected={selectedNodes[0]} />
        ) */}
        
        {selectedNodes.length > 0 && (
          <DetailsPopup
            forceGraph={fg.current}
            selected={selectedNodes[0]} />
        )}
      </main>
    </div>
  )
}