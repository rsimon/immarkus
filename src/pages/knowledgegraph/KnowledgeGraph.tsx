import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTransition, animated, easings } from '@react-spring/web';
import { NodeObject } from 'react-force-graph-2d';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { GraphView } from './GraphView';
import { Legend } from './Legend';
import { GraphNode } from './Types';
import { useGraph } from './useGraph';
import { GraphControls } from './GraphControls';
import { SettingsPanel } from './SettingsPanel';
import { SelectionDetailsDrawer } from './SelectionDetailsDrawer';
import { useKnowledgeGraphSettings, useSelectedNodes, useShowGraphSearch } from './KnowledgeGraphState';
import { GraphSearch } from './GraphSearch';

export const KnowledgeGraph = () => {

  const { selectedNodes, setSelectedNodes } = useSelectedNodes();

  // Skip the sidebar slide animation if there already is a persisted selection
  // when this page mounts
  const skipSidebarAnimation = useMemo(() => selectedNodes.length > 0, []);

  const [pinnedNodes, setPinnedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const { settings, setSettings } = useKnowledgeGraphSettings();

  const [query, setQuery] = useState<((n: NodeObject<GraphNode>) => boolean | undefined)>(undefined);

  const { annotations, graph } = useGraph(settings);

  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const { showGraphSearch, setShowGraphSearch } = useShowGraphSearch();

  const [transitionProgress, setTransitionProgress] = useState(0);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Don't animate the initial render
  const [isFirstRender, setIsFirstRender] = useState(true);

  const transition = useTransition([isFullscreen], {
    from: { maxWidth: 0, opacity: 0 },
    enter: { maxWidth: 250, opacity: 1 },
    leave: { maxWidth: 0, opacity: 0 },
    immediate: isFirstRender,
    config:{
      duration: 250,
      easing: easings.easeInOutCubic
    },
    onChange: ({ value }) => setTransitionProgress(value.maxWidth)
  });

  useEffect(() => setIsFirstRender(false), []);

  const onCloseSearch = () => {
    setQuery(undefined);
    setShowGraphSearch(false);
  }

  const onToggleSearch = () => {
    if (showGraphSearch)
      onCloseSearch();
    else
      setShowGraphSearch(true);
  }

  // Important to memo-ize, since otherwise child components re-render unnecessarily
  const onCloseSelectionDetails = useCallback(() => setSelectedNodes([]), [setSelectedNodes]);

  return (
    <div className="page-root">
      {transition((style, fullscreen) => !fullscreen && (
        <animated.div style={style} className="flex">
          <AppNavigationSidebar />
        </animated.div>
      ))}

      <main className="page graph relative overflow-x-hidden !overflow-hidden">
        {transition((style, fullscreen) => !fullscreen && (
          <animated.div 
            style={{ opacity: style.opacity }}
            className="absolute top-4 left-6 z-10">
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
          </animated.div>
        ))}

        <GraphView 
          graph={graph}
          transitionProgress={transitionProgress}
          isFullscreen={isFullscreen}
          settings={settings}
          selected={selectedNodes}
          pinned={pinnedNodes}
          query={query}
          onBackgroundClick={() => setShowSettingsPanel(false)}
          onPin={node => setPinnedNodes(n => ([...n, node]))}
          onSelect={node => node ? setSelectedNodes([node]) : setSelectedNodes([])} />

        <Legend />

        <div className="absolute top-0 right-0 h-full flex">
          <div className="relative">
            <div className="absolute right-2 bottom-16 w-[360px] p-4 overflow-hidden pointer-events-none z-10">
              <SettingsPanel 
                open={showSettingsPanel} 
                settings={settings}
                onChangeSettings={setSettings} />
            </div>
              
            <GraphControls 
              hasPinnedNodes={pinnedNodes.length > 0} 
              isFullScreen={isFullscreen} 
              isSearchOpen={showGraphSearch}
              isSettingsOpen={showSettingsPanel}
              onToggleFullscreen={() => setIsFullscreen(fullscreen => !fullscreen)}
              onToggleSearch={onToggleSearch}
              onToggleSettings={() => setShowSettingsPanel(open => !open)}
              onUnpinAllNodes={() => setPinnedNodes([])} />
          </div>

          {graph && (
            <SelectionDetailsDrawer 
              graph={graph}
              selected={selectedNodes[0]}
              settings={settings} 
              skipInitialAnimation={skipSidebarAnimation}
              onClose={onCloseSelectionDetails} />
          )}
        </div>

        {(graph && showGraphSearch) && (
          <GraphSearch 
            annotations={annotations}
            graph={graph} 
            isFullscreen={isFullscreen}
            query={query}
            settings={settings}
            onChangeQuery={query => setQuery(() => query)}
            onClose={onCloseSearch} />
        )}
      </main> 
    </div>
  )
  
}