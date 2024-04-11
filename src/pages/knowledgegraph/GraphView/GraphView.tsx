import { useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D, { NodeObject, ForceGraphMethods } from 'react-force-graph-2d';
import { Graph, GraphNode } from '../Types';
import { PALETTE } from './Palette';

interface GraphViewProps {

  graph: Graph;

  showIsolatedNodes?: boolean;

  onSelect?(node: GraphNode): void;

}

const MAX_NODE_SIZE = 10;
const MIN_NODE_SIZE = 5;

const MAX_LINK_WIDTH = 3;
const MIN_LINK_WIDTH = 1;

export const GraphView = (props: GraphViewProps) => {

  const { graph } = props;

  const nodeScale = graph && (MAX_NODE_SIZE - MIN_NODE_SIZE) / (graph.maxDegree - graph.minDegree);

  const linkScale = graph && (MAX_LINK_WIDTH - MIN_LINK_WIDTH) / (graph.maxLinkWeight - graph.minLinkWeight);

  const el = useRef<HTMLDivElement>(null);

  const fg = useRef<ForceGraphMethods>();

  const [dimensions, setDimensions] = useState<[number, number] | undefined>();

  const nodeFilter = useMemo(() => (props.showIsolatedNodes 
    ? undefined
    : (node: NodeObject<GraphNode>) => node.degree > 0
  ), [props.showIsolatedNodes]);

  useEffect(() => {
    if (fg.current && props.showIsolatedNodes) fg.current.zoomToFit(400, 100)
  }, [props.showIsolatedNodes]);

  const canvasObject = (node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D, scale: number) => {
    const r = nodeScale * node.degree + MIN_NODE_SIZE;

    ctx.fillStyle = node.type === 'IMAGE' ? PALETTE['orange'] : PALETTE['blue'];
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5 / scale;

    ctx.beginPath();
    ctx.arc(node.x, node.y, r / scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black'; 
    ctx.font = `${11 / scale}px Arial`;
    ctx.fillText(node.label, node.x + 12 / scale, node.y + 12 / scale); 
  }

  const onNodeHover = (node?: NodeObject<GraphNode>) => {
    if (node)
      el.current.style.cursor = 'pointer';
    else 
      el.current.style.cursor = 'auto';
  }

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

  return (
    <div ref={el} className="w-full h-full">
      {dimensions && (
        <ForceGraph2D 
          ref={fg}
          width={dimensions[0]}
          height={dimensions[1]}
          graphData={graph} 
          linkWidth={({ value }) => linkScale * value + MIN_LINK_WIDTH}
          nodeVisibility={nodeFilter}
          nodeCanvasObject={canvasObject}
          nodeColor={n => n.type === 'IMAGE' ? PALETTE['orange'] : PALETTE['blue']}
          onNodeHover={onNodeHover} />
      )}
    </div>
  )

}