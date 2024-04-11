import { useState } from 'react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { GraphView, Legend, useGraph } from './GraphView';
import { GraphNode } from './Types';
import { SelectionDetails } from './SelectionDetails';
import { GraphSettings } from './GraphSettings';

export const KnowledgeGraph = () => {

  const graph = useGraph();

  const [selected, setSelected] = useState<GraphNode | undefined>();

  const [showIsolatedNodes, setShowIsolatedNodes] = useState(true);

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page graph relative">
        <div className="absolute top-4 left-6 z-10">
          <h1 className="text-xl font-semibold tracking-tight mb-1">
            <span className="bg-white/70 backdrop-blur-sm">
              Knowledge Graph
            </span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-lg leading-6">
            <span className="bg-white/70 backdrop-blur-sm">
              Explore connections between images and entities. Zoom and pan the graph with your mouse.
              Grab and pull a node to re-arrange the graph. Click a node to see more information.
            </span>
          </p>
        </div>

        <GraphView 
          graph={graph}
          showIsolatedNodes={showIsolatedNodes}
          onSelect={setSelected} />

        <GraphSettings 
          onHideIsolated={checked => setShowIsolatedNodes(!checked)} />

        <Legend />

        {false && (
          <SelectionDetails
            graph={graph}
            selected={selected} />
        )}
      </main>
    </div>
  )
}