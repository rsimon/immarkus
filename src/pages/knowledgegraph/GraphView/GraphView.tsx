import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { LinkObject, NodeObject, ForceGraphMethods } from 'react-force-graph-2d';
import { usePrevious } from '@/utils/usePrevious';
import { Graph, GraphNode, GraphSettings } from '../Types';
import { PALETTE } from '../Palette';

import './GraphView.css';

interface GraphViewProps {

  graph: Graph;

  isFullscreen: boolean;

  settings: GraphSettings;

  selected: GraphNode[];

  pinned: NodeObject<GraphNode>[];

  onBackgroundClick(): void;

  onSelect(node?: NodeObject<GraphNode>): void;

  onPin(node: NodeObject<GraphNode>): void;

}

const MAX_NODE_SIZE = 10;
const MIN_NODE_SIZE = 5;

const MAX_LINK_WIDTH = 3;
const MIN_LINK_WIDTH = 1;

export const GraphView = (props: GraphViewProps) => {

  const { graph } = props;

  const previousPinned = usePrevious<NodeObject<GraphNode>[]>(props.pinned);

  const nodeScale = graph && (MAX_NODE_SIZE - MIN_NODE_SIZE) / (graph.maxDegree - graph.minDegree);

  const linkScale = graph && (MAX_LINK_WIDTH - MIN_LINK_WIDTH) / (graph.maxLinkWeight - graph.minLinkWeight);

  const el = useRef<HTMLDivElement>(null);

  const fg = useRef<ForceGraphMethods>();

  const [dimensions, setDimensions] = useState<[number, number] | undefined>();

  // The selected neighbourhood (if any): IDs of selected nodes + directly connected nodes
  const neighbourhood: Set<string> = useMemo(() => {
    if (!graph) return new Set([]);

    return props.selected.length > 0 ? 
      new Set(props.selected.reduce<string[]>((all, selected) => (
        [...all, selected.id, ...graph.getLinkedNodes(selected.id).map(n => n.id)]
      ), [])) : new Set([])
  }, [graph, props.selected]);

  // Shorthands
  const hasSelection = props.selected.length > 0;
  const selectedIds = new Set(props.selected.map(n => n.id));

  const nodeFilter = useMemo(() => (props.settings.hideIsolatedNodes 
    ? (node: NodeObject<GraphNode>) => node.degree > 0
    : undefined
  ), [props.settings]);

  useEffect(() => {
    if (fg.current && !props.settings.hideIsolatedNodes) fg.current.zoomToFit(400, 100)
  }, [props.settings.hideIsolatedNodes]);

  useEffect(() => {
    // Trivial solution for now
    if (previousPinned?.length > 0 && props.pinned?.length === 0) {
      previousPinned.forEach(n => {
        n.fx = undefined;
        n.fy = undefined;
      })

      fg.current.d3ReheatSimulation();
    }
  }, [props.pinned]);

  useEffect(() => {
    const onResize = () => {
      const { clientWidth, clientHeight } = el.current;
      setDimensions([clientWidth, clientHeight]);
    }

    window.addEventListener('resize', onResize);

    // Initial size
    onResize();
    
    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, [graph]);

  useEffect(() => {
    // Resize the canvas when fullscreen mode changes
    const { clientWidth, clientHeight } = el.current;
    setDimensions([clientWidth, clientHeight]);
  }, [props.isFullscreen]);

  const canvasObject = (node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D, scale: number) => {
    const r = nodeScale * node.degree + MIN_NODE_SIZE;

    // Node should fade out if there is a selection, and this node is not in the neighbourhood
    const isFaded = hasSelection && !neighbourhood.has(node.id);

    const color = node.type === 'IMAGE' 
      ? PALETTE['blue'] : node.type === 'ENTITY_TYPE' ? PALETTE['green'] : PALETTE['purple'];

    ctx.globalAlpha = isFaded ? 0.12 : 1;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1 / scale;

    ctx.beginPath();
    ctx.arc(node.x, node.y, r / scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();

    // Faded nodes never get labels
    if (!props.settings.hideLabels && !isFaded) {
      ctx.fillStyle = 'black'; 
      ctx.font = `${11 / scale}px Arial`;
      ctx.fillText(node.label, node.x + 12 / scale, node.y + 12 / scale); 
    }

    ctx.globalAlpha = 1;
  }

  const onBackgroundClick = () => {
    props.onSelect(undefined);
    props.onBackgroundClick();
  }

  const onNodeDragEnd = (node: NodeObject<GraphNode>) => {
    // Pin this node
    node.fx = node.x;
    node.fy = node.y;

    props.onPin(node);
  }

  const onNodeHover = (node?: NodeObject<GraphNode>) => {
    if (node)
      el.current.style.cursor = 'pointer';
    else 
      el.current.style.cursor = 'default';
  }

  const getLinkWidth = (link: LinkObject) => {
    if (hasSelection) {
      const targetId: string = (link.target as any).id || link.target;
      const sourceId: string = (link.source as any).id || link.source;

      if (selectedIds.has(targetId) || selectedIds.has(sourceId))
        return linkScale * link.value + MIN_LINK_WIDTH;
      else 
        return 0.00001; // Don't set to 0 because force-graph will use default width!
    } else {
      return linkScale * link.value + MIN_LINK_WIDTH;
    }
  }

  return (
    <div ref={el} className="graph-view w-full h-full">
      {dimensions && (
        <ForceGraph2D 
          ref={fg}
          width={dimensions[0]}
          height={dimensions[1]}
          graphData={graph} 
          linkWidth={getLinkWidth}
          nodeLabel={props.settings.hideLabels ? (node: GraphNode) => node.label || node.id : undefined}
          nodeVisibility={nodeFilter}
          nodeCanvasObject={canvasObject}
          nodeColor={n => n.type === 'IMAGE' ? PALETTE['orange'] : PALETTE['blue']}
          onBackgroundClick={onBackgroundClick}
          onLinkClick={onBackgroundClick}
          onNodeClick={n => props.onSelect(n as GraphNode)}
          onNodeDragEnd={onNodeDragEnd}
          onNodeHover={onNodeHover} />
      )}
    </div>
  )

}