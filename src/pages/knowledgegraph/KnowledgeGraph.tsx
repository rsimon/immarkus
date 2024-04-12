import { useState } from 'react';
import { NodeObject } from 'react-force-graph-2d';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { GraphView } from './GraphView';
import { Legend } from './Legend';
import { GraphNode, GraphSettings, GraphViewportTransform } from './Types';
import { useGraph } from './useGraph';
import { Controls } from './Controls';
import { DetailsPopup } from './DetailsPopup';

export const KnowledgeGraph = () => {

  const graph = useGraph();

  const [selectedNodes, setSelectedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const [pinnedNodes, setPinnedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const [settings, setSettings] = useState<GraphSettings>({});

  const [transform, setTransform] = useState<GraphViewportTransform | undefined>();

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
          graph={graph}
          settings={settings}
          selected={selectedNodes}
          pinned={pinnedNodes}
          onPin={node => setPinnedNodes(n => ([...n, node]))}
          onSelect={node => node ? setSelectedNodes([node]) : setSelectedNodes([])}
          onUpdateViewport={transform => setTransform(() => transform)}/>

        <Legend />

        <Controls 
          isFullScreen={false} 
          hasPinnedNodes={pinnedNodes.length > 0} 
          settingsOpen={false}
          onToggleFullscreen={() => console.log('toggle fullscreen')} 
          onToggleSettings={() => console.log('toggle fullscreen')} 
          onUnpinAllNodes={() => setPinnedNodes([])} />

        {selectedNodes.length > 0 && (
          <DetailsPopup
            anchor={selectedNodes[0]}
            graph={graph}
            transform={transform} />
        )}
      </main>
    </div>
  )
}