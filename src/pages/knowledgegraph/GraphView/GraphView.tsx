import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { LinkObject, NodeObject, ForceGraphMethods } from 'react-force-graph-2d';
import { RelationGraph } from '@/store';
import { usePrevious } from '@/utils/usePrevious';
import { GRAY, ORANGE } from './GraphViewColors';
import { Graph, GraphNode, KnowledgeGraphSettings } from '../Types';
import { PALETTE } from '../Palette';

import './GraphView.css';

interface GraphViewProps {

  graph: Graph;

  isFullscreen: boolean;

  query?: ((n: NodeObject<GraphNode>) => boolean);

  relations: RelationGraph;

  settings: KnowledgeGraphSettings;

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

  const { graph, settings } = props;

  const previousPinned = usePrevious<NodeObject<GraphNode>[]>(props.pinned);

  const nodeScale = graph && (MAX_NODE_SIZE - MIN_NODE_SIZE) / (graph.maxDegree - graph.minDegree);

  const linkScale = graph && (MAX_LINK_WIDTH - MIN_LINK_WIDTH) / (graph.maxLinkWeight - graph.minLinkWeight);

  const el = useRef<HTMLDivElement>(null);

  const fg = useRef<ForceGraphMethods>();

  const [dimensions, setDimensions] = useState<[number, number] | undefined>();

  const [zoom, setZoom] = useState(1);

  const selectedIds = new Set(props.selected.map(n => n.id));

  const [hovered, setHovered] = useState<GraphNode | undefined>();

  // The highlighted neighbourhoods (if any)
  const highlighted: Set<string> | undefined = useMemo(() => {
    // No highlighted nodes if:
    // - no graph
    // - no current hover
    // - no active query
    // - no selection
    if (!graph || (!hovered && !props.query && (props.selected || []).length === 0)) return;

    // Highlighted due to hover
    const hoverNeighbourhood = 
      hovered ? [hovered.id, ...graph.getLinkedNodes(hovered.id).map(n => n.id)]: [];

    const selectedNeighbourhood = selectedIds.size > 0 
      ? props.selected.reduce<string[]>((all, selected) => (
        [...all, selected.id, ...graph.getLinkedNodes(selected.id).map(n => n.id)]
      ), []) 
      : [];

    return new Set([...hoverNeighbourhood, ...selectedNeighbourhood]);
  }, [graph, hovered, props.query, props.selected]);

  const nodesInQuery = useMemo(() => props.query
    ? new Set(graph.nodes.filter(n => props.query(n)).map(n => n.id))
    : new Set([])
  , [props.query]);

  const nodeFilter = useMemo(() => {
    if (!graph) return;

    const relations = [...graph.links].filter(l => l.type === 'RELATION');
    
    const withRelation = new Set(relations.reduce<string[]>((all, link) => (
      // Force graph mutates links in place... source could be string or node object
      [...all, (link.source as any).id || link.source, (link.target as any).id || link.target]
    ), []));

    return settings.hideIsolatedNodes 
      ? settings.graphMode === 'HIERARCHY' 
        ? (node: NodeObject<GraphNode>) => node.degree > 0
        : (node: NodeObject<GraphNode>) => withRelation.has(node.id)
      : undefined
    }, [settings, graph]);

  useEffect(() => {
    if (fg.current && !settings.hideIsolatedNodes) fg.current.zoomToFit(400, 100)
  }, [settings.hideIsolatedNodes]);

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

    const isOpaque =
      // All nodes are opaque if there is no current highlight set or no query
      (!highlighted && !props.query) ||
      // Hover or selection neighbourhood?
      (highlighted?.has(node.id)) ||
      // or if there's a query and the node matches it
      (props.query && props.query(node));
     
    const color = node.type === 'IMAGE' 
      ? PALETTE['blue'] : node.type === 'ENTITY_TYPE' ? PALETTE['green'] : PALETTE['purple'];

    ctx.globalAlpha = isOpaque ? 1 : 0.12;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1 / scale;

    ctx.beginPath();
    ctx.arc(node.x, node.y, r / scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();

    // Faded nodes never get labels
    if (!settings.hideLabels && isOpaque) {
      ctx.fillStyle = 'black'; 
      ctx.font = `${11 / scale}px Arial`;
      ctx.fillText(node.label, node.x + 12 / scale, node.y + 12 / scale); 
    }

    ctx.globalAlpha = 1;

    // Selection circle
    if (selectedIds.has(node.id)) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, (r + 1.5) / scale, 0, 2 * Math.PI, false);
      ctx.lineWidth = 3 / scale;
      ctx.strokeStyle = '#fff';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(node.x, node.y, (r + 4) / scale, 0, 2 * Math.PI, false);
      ctx.lineWidth = 3 / scale;
      ctx.strokeStyle = ORANGE
      ctx.stroke();
    }
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
    setHovered(node);

    if (node)
      el.current.style.cursor = 'pointer';
    else 
      el.current.style.cursor = 'default';
  }

  const getLinkWidth = (link: LinkObject) => {
    if (highlighted || props.query) {
      const targetId: string = (link.target as any).id || link.target;
      const sourceId: string = (link.source as any).id || link.source;

      const isHidden = highlighted 
        ? !(highlighted.has(targetId) && highlighted.has(sourceId))
        : props.query && !(nodesInQuery.has(targetId) && nodesInQuery.has(sourceId));

      // Don't set to 0 because force-graph will use default width (0 is falsy!)
      return isHidden ? 0.00001 : linkScale * link.value + MIN_LINK_WIDTH;
    } else {
      return linkScale * link.value + MIN_LINK_WIDTH;
    }
  }

  const getLinkLabel = (link: LinkObject) => {
    const { id: sourceId, type: sourceType }: { id: string, type: string } = link.source as any;
    const { id: targetId, type: targetType }: { id: string, type: string } = link.target as any;

    // Labels are for IMAGE-IMAGE or ENTITY-ENTITY links
    if (sourceType !== targetType)
      return;

    if (sourceType === 'ENTITY_TYPE') {
      const relations = props.relations.listRelations().filter(r =>
        sourceId === r.sourceEntityType && targetId === r.targetEntityType);

      const distinctLabels = Array.from(new Set(relations.map(r => r.relationName)));

      if (distinctLabels.length > 0)
        return distinctLabels.join(', ');
    } else if (sourceType === 'IMAGE') {
      const outbound = props.relations.getLinksBetween(sourceId, targetId); 
      const inbound = props.relations.getLinksBetween(targetId, sourceId);

      const distinctLabels = Array.from(new Set([
        ...outbound.map(r => r.relationName),
        ...inbound.map(r => r.relationName)
      ]));

      if (distinctLabels.length > 0)
        return distinctLabels.join(', ');     
    }
  }

  const getLinkColor = (link: LinkObject) => {
    // Relation links get default color
    if (link.type === 'RELATION') return ORANGE;

    const toHighlight = hovered ? new Set([...selectedIds, hovered.id]) : selectedIds;
    if (toHighlight.size > 0) {
      const source = link.source as NodeObject<GraphNode>;
      const target = link.target as NodeObject<GraphNode>;

      return toHighlight.has(source.id) || toHighlight.has(target.id)
        ? GRAY : '#ffffff00';
    } else {
      return '#ffffff00';
    }
  }
  
  const getLinkDirectionalArrowLength = (link: LinkObject) => {
    if (!(link.type === 'RELATION') || !((link.source as NodeObject).type === 'ENTITY_TYPE')) return;
  
    const targetId: string = (link.target as any).id || link.target;
    const sourceId: string = (link.source as any).id || link.source;

    if (targetId === sourceId)
      return 0.00001;

    if (highlighted || props.query) {
      const isHidden = highlighted 
        ? !(highlighted.has(targetId) && highlighted.has(sourceId))
        : props.query && !(nodesInQuery.has(targetId) && nodesInQuery.has(sourceId));

      // Don't set to 0 because force-graph will use default width (0 is falsy!)
      return isHidden ? 0.00001 : linkScale * link.value + MIN_LINK_WIDTH;
    } else {
      return (20 + link.value) / zoom;
    }
  }

  const getLinkCurvature = (link: LinkObject) =>
    (link.source as NodeObject).id === (link.target as NodeObject).id ? 0.5 : 0;

  return (
    <div ref={el} className="graph-view w-full h-full overflow-hidden">
      {dimensions && (
        <ForceGraph2D 
          ref={fg}
          width={dimensions[0]}
          height={dimensions[1]}
          graphData={graph} 
          linkColor={settings.graphMode === 'RELATIONS' ? getLinkColor : undefined}
          linkCurvature={getLinkCurvature}
          linkDirectionalArrowColor={() => ORANGE}
          linkDirectionalArrowLength={getLinkDirectionalArrowLength}
          linkDirectionalArrowRelPos={1}
          linkLabel={settings.graphMode === 'RELATIONS' ? getLinkLabel : undefined}
          linkWidth={getLinkWidth}
          nodeCanvasObject={canvasObject}
          nodeColor={n => n.type === 'IMAGE' ? PALETTE['orange'] : PALETTE['blue']}
          nodeLabel={settings.hideLabels ? (node: GraphNode) => node.label || node.id : undefined}
          nodeRelSize={1.2 * window.devicePixelRatio / zoom}
          nodeVal={n => nodeScale * n.degree + MIN_NODE_SIZE}
          nodeVisibility={nodeFilter}
          onBackgroundClick={onBackgroundClick}
          onLinkClick={onBackgroundClick}
          onNodeClick={n => props.onSelect(n as GraphNode)}
          onNodeDragEnd={onNodeDragEnd}
          onNodeHover={onNodeHover} 
          onZoomEnd={z => setZoom(z.k)}/>
      )}
    </div>
  )

}