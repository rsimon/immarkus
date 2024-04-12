import { useState } from 'react';
import { NodeObject } from 'react-force-graph-2d';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { GraphView } from './GraphView';
import { Legend } from './Legend';
import { GraphNode, GraphSettings } from './Types';
import { useGraph } from './useGraph';
import { Controls } from './Controls';
import { SelectionDetails } from './SelectionDetails';
import { SettingsPanel } from './SettingsPanel';

export const KnowledgeGraph = () => {

  const graph = useGraph();

  const [selectedNodes, setSelectedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const [pinnedNodes, setPinnedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const [settings, setSettings] = useState<GraphSettings>({});

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

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
          onSelect={node => node ? setSelectedNodes([node]) : setSelectedNodes([])} />

        <Legend />

        <Controls 
          isFullScreen={false} 
          hasPinnedNodes={pinnedNodes.length > 0} 
          settingsOpen={showSettingsPanel}
          onToggleFullscreen={() => console.log('toggle fullscreen')} 
          onToggleSettings={() => setShowSettingsPanel(open => !open)}
          onUnpinAllNodes={() => setPinnedNodes([])} />

        <aside 
          className="absolute right-2 top-0 bottom-16 w-[360px] p-4 flex flex-col 
            gap-2 overflow-hidden pointer-events-none z-10">
          <div className="flex-grow relative overflow-y-auto rounded-b">
            {selectedNodes.length > 0 && (
              <SelectionDetails
                selected={selectedNodes[0]}
                graph={graph} />
            )}
          </div>

          <SettingsPanel 
            open={showSettingsPanel} 
            settings={settings}
            onChangeSettings={setSettings} />
        </aside>
      </main>
    </div>
  )
}