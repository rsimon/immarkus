import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { LinkObject, NodeObject, ForceGraphMethods } from 'react-force-graph-2d';
import { usePrevious } from '@/utils/usePrevious';
import { NODE_COLORS, LINK_COLORS, LINK_STYLES, ORANGE } from '../Styles';
import { Graph, GraphLink, GraphNode, KnowledgeGraphSettings } from '../Types';
import { hasRelations } from './graphViewUtils';

import './GraphView.css';

interface GraphViewProps {

  graph: Graph;

  transitionProgress: number;

  isFullscreen: boolean;

  query?: ((n: NodeObject<GraphNode>) => boolean);

  settings: KnowledgeGraphSettings;

  selected: GraphNode[];

  pinned: NodeObject<GraphNode>[];

  onBackgroundClick(): void;

  onSelect(node?: NodeObject<GraphNode>): void;

  onPin(node: NodeObject<GraphNode>): void;

}

const MAX_NODE_SIZE = 10;
const MIN_NODE_SIZE = 5;

const MAX_LINK_WIDTH = 10;
const MIN_LINK_WIDTH = 1;

let globalScale = 1;

export const GraphView = (props: GraphViewProps) => {

  const { graph, settings } = props;

  const previousPinned = usePrevious<NodeObject<GraphNode>[]>(props.pinned);

  const nodeScale = graph && (MAX_NODE_SIZE - MIN_NODE_SIZE) / (graph.maxDegree - graph.minDegree);

  const linkScale = graph && (MAX_LINK_WIDTH - MIN_LINK_WIDTH) / (graph.maxLinkWeight - graph.minLinkWeight);

  const el = useRef<HTMLDivElement>(null);

  const fg = useRef<ForceGraphMethods>();

  const [dimensions, setDimensions] = useState<[number, number] | undefined>();

  const zoom = useRef(1);

  const selectedIds = new Set(props.selected.map(n => n.id));

  const [hovered, setHovered] = useState<GraphNode | undefined>();

  const highlighted = useMemo(() => {
    // No highlighted nodes if:
    // - no graph
    // - no current hover
    // - no active query
    // - no selection
    if (!graph || (!hovered && !props.query && (props.selected || []).length === 0))
      return;

    // Highlighted due to hover
    const hoverNeighbourhood = 
      hovered ? [hovered.id, ...graph.getLinkedNodes(hovered.id).map(n => n.id)]: [];

    const selectedNeighbourhood = selectedIds.size > 0 
      ? props.selected.reduce<string[]>((all, selected) => (
        [...all, selected.id, ...graph.getLinkedNodes(selected.id).map(n => n.id)]
      ), []) 
      : [];

    // Is the hovered node actually visible? It's not if:
    // - we're in RELATIONS mode, and 
    // - the node has neither relations, nor is part of the selected neighbourhood
    const isHoverVisible = settings.graphMode === 'HIERARCHY' || (
      hovered && (hasRelations(hovered, graph) || selectedNeighbourhood.includes(hovered.id)));

    return isHoverVisible 
      ? new Set([...hoverNeighbourhood, ...selectedNeighbourhood]) 
      : selectedNeighbourhood.length > 0 ? new Set(selectedNeighbourhood) : undefined;
  }, [graph, hovered, props.query, props.selected, settings.graphMode]);

  const nodesInQuery = useMemo(() => props.query
    ? new Set(graph.nodes.filter(n => props.query(n)).map(n => n.id))
    : new Set([])
  , [props.query]);

  const nodeFilter = useMemo(() => {
    if (!graph) return;

    return settings.hideIsolatedNodes 
        ? (node: NodeObject<GraphNode>) => node.degree > 0
        : undefined;
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
  }, [props.transitionProgress]);

  const getNodeDisplayMode = (node: NodeObject<GraphNode>) => {
    // In RELATIONS mode, only nodes with relations are visible 
    const isVisible = 
      props.settings.graphMode === 'HIERARCHY' || hasRelations(node, graph);

    const isOpaque =
      // All nodes are opaque if they are visible and there is no current highlight set or no query
      (isVisible && !highlighted && !props.query) ||
      // Hover or selection neighbourhood?
      (highlighted?.has(node.id)) ||
      // or if there's a query and the node matches it
      (props.query && props.query(node));

    return { isVisible, isOpaque };
  }

  const isNodeVisible = (node: NodeObject<GraphNode>) => {
    const { isVisible, isOpaque } = getNodeDisplayMode(node);

    const satisfiesCurrentFilter =  nodeFilter ? nodeFilter(node) : true;

    return (isVisible || isOpaque) && satisfiesCurrentFilter;
  }

  const canvasObject = (node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D, scale: number) => {
    globalScale = scale;

    const r = nodeScale * node.degree + MIN_NODE_SIZE;

    const { isVisible, isOpaque } = getNodeDisplayMode(node);

    // If the node is not marked as visible, nor as fully opaque we can end here
    if (!isVisible && !isOpaque) return;

    const color = NODE_COLORS[node.type];

    ctx.globalAlpha = isOpaque ? 1 : 0.12;
    ctx.fillStyle = color;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1 / scale;

    ctx.beginPath();
    ctx.arc(node.x, node.y, r / scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();

    const hideLabel = 
      // Faded nodes never get labels
      !isOpaque ||
      // Hide all labels
      settings.hideAllLabels ||
      // Hide this node type label
      (settings.hideNodeTypeLabels && settings.hideNodeTypeLabels.includes(node.type));

    // Faded nodes never get labels
    if (!hideLabel) {
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

  const isLinkVisible = (link: LinkObject) => {
    if (highlighted) {
      // If there is a highlighted neighbourhood, only those links are visible
      const targetId: string = (link.target as any).id || link.target;
      const sourceId: string = (link.source as any).id || link.source;
      return (highlighted.has(targetId) && highlighted.has(sourceId));
    } else if (props.query) {
      const targetId: string = (link.target as any).id || link.target;
      const sourceId: string = (link.source as any).id || link.source;
      return (nodesInQuery.has(targetId) && nodesInQuery.has(sourceId));
    } else {
      // All links are visible in HIERARCHY mode
      if (props.settings.graphMode === 'HIERARCHY') return true;

      const primitives = (link as GraphLink).primitives;

      const types = [...new Set(primitives.reduce<string[]>((t, p) => ([...t, p.type]), []))];

      // In RELATIONS mode links are only visible if they have one of the following
      // types...
      const show = new Set([
        'HAS_RELATED_ANNOTATION_IN',
        'IS_RELATED_VIA_ANNOTATION'
      ]);

      return types.some(t => show.has(t));
    }
  }

  const getLinkWidth = (link: LinkObject) => linkScale * (link.weight - 1) + MIN_LINK_WIDTH;

  const getLinkLabel = (link: LinkObject) => {
    const primitives = (link as GraphLink).primitives;

    const types = [...new Set(primitives.reduce<string[]>((t, p) => ([...t, p.type]), []))];

    const relations = new Set(primitives.reduce<string[]>((r, p) => p.value ? [...r, p.value] : r, []));

    if (types.length > 1) return;

    const t = types[0];

    if (t === 'FOLDER_CONTAINS_SUBFOLDER') {
      return 'Sub-Folder';
    } else if (t === 'FOLDER_CONTAINS_IMAGE') {
      return 'Image is in Sub-Folder';
    } else if (t === 'IS_PARENT_TYPE_OF') {
      return 'Entity Class Hierarchy';
    } else if (t === 'HAS_ENTITY_ANNOTATION') {
      return `Image has ${link.weight} entity annotation${link.weight ===  1 ? '' : 's'}`;
    } else if (t === 'HAS_RELATED_ANNOTATION_IN') {
      return link.source === link.target 
        ? `${link.weight} Relationship${link.weight ===  1 ? '' : 's'} inside this image (${[...relations].join(', ')})`
        : `${link.weight} Relationship${link.weight === 1 ? '' : 's'} between these images (${[...relations].join(', ')})`;
    } else if (t === 'IS_RELATED_VIA_ANNOTATION') {
      return link.source === link.target
        ? `${link.weight} Relationship${link.weight === 1 ? '' : 's'} between entities of this class (${[...relations].join(', ')})`
        : `Connected via ${link.weight} Relationship${link.weight === 1 ? '' : 's'} (${[...relations].join(', ')})`
    }
  }

  const getLinkColor = (link: LinkObject) => {
    const primitives = (link as GraphLink).primitives;
    
    const types = [...new Set(primitives.reduce<string[]>((t, p) => ([...t, p.type]), []))];

    if (props.settings.graphMode === 'HIERARCHY') {
      // Hierarchy & annotations mode
      if (types.length === 1) {
        return LINK_COLORS[primitives[0].type];
      } else {
        return LINK_COLORS.DEFAULT;
      }
    } else {
      // Relations mode
      if (types.length === 1) {
        const t = types[0];

        const show = new Set([
          'HAS_RELATED_ANNOTATION_IN',
          'IS_RELATED_VIA_ANNOTATION',
          'FOLDER_CONTAINS_SUBFOLDER',
          'FOLDER_CONTAINS_IMAGE'
        ]);

        if (show.has(t)) {
          // Always show relation & folder hierarchy
          return LINK_COLORS[t];
        } else if (highlighted) {
          // Show additional links on hover
          const targetId: string = (link.target as any).id || link.target;
          const sourceId: string = (link.source as any).id || link.source;
    
          return (highlighted.has(targetId) && highlighted.has(sourceId))
            ? LINK_COLORS[t] : '#00000000'; // transparent
        } else {
          return '#00000000'; // transparent
        }
      }
    }
  }

  const getLinkCurvature = (link: LinkObject) =>
    (link.source as NodeObject).id === (link.target as NodeObject).id ? 0.5 : 0;

  const getLinkStyle = (link: LinkObject) => {
    const primitives = (link as GraphLink).primitives;
    if (primitives.length === 1)
      return LINK_STYLES[primitives[0].type]?.map((n: number) => n / globalScale);
  }

  const getNodeLabel = (node: GraphNode) => {
    if (settings.hideAllLabels || settings.hideNodeTypeLabels?.includes(node.type))
      return node.label || node.id;
  }

  return (
    <div ref={el} className="graph-view w-full h-full overflow-hidden">
      {dimensions && (
        <ForceGraph2D
          ref={fg}
          width={dimensions[0]}
          height={dimensions[1]}
          graphData={graph} 
          linkColor={getLinkColor}
          linkCurvature={getLinkCurvature}
          linkDirectionalArrowRelPos={1}
          linkLineDash={getLinkStyle}
          linkLabel={getLinkLabel}
          linkVisibility={isLinkVisible}
          linkWidth={getLinkWidth}
          nodeCanvasObject={canvasObject}
          nodeLabel={getNodeLabel}
          nodeRelSize={1.2 * window.devicePixelRatio / zoom.current}
          nodeVal={n => nodeScale * n.degree + MIN_NODE_SIZE}
          nodeVisibility={isNodeVisible}
          onBackgroundClick={onBackgroundClick}
          onLinkClick={onBackgroundClick}
          onNodeClick={n => props.onSelect(n as GraphNode)}
          onNodeDragEnd={onNodeDragEnd}
          onNodeHover={onNodeHover} 
          onZoomEnd={z => zoom.current = z.k} />
      )}
    </div>
  )

}