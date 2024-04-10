import { useEffect, useRef } from 'react';
import { ForceGraph } from './ForceGraph_old_2';
import { Graph, GraphNode } from '../Types';
import ForceGraph2D, { NodeObject } from 'react-force-graph-2d';

import './GraphView.css';
import { PALETTE } from './Palette';

interface GraphViewProps {

  graph: Graph;

  onSelect?(node: GraphNode): void;

}

export const GraphView = (props: GraphViewProps) => {

  const { graph } = props;

  const el = useRef<HTMLDivElement>(null);

  const canvasObject = (node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D, scale: number) => {
    ctx.fillStyle = node.type === 'IMAGE' ? PALETTE['orange'] : PALETTE['blue'];
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5 / scale;
    ctx.beginPath();
    ctx.arc(node.x, node.y, 6 / scale, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'black'; // Set text color
    ctx.font = `${11 / scale}px Arial`;
    ctx.fillText(node.label, node.x + 10 / scale, node.y + 5 / scale); 
  }

  const onNodeHover = (node?: NodeObject<GraphNode>) => {
    if (node)
      el.current.style.cursor = 'pointer';
    else 
      el.current.style.cursor = 'auto';
  }

  return (
    <div ref={el}>
      <ForceGraph2D 
        graphData={graph} 
        linkWidth={3}
        nodeCanvasObject={canvasObject}
        nodeColor={n => n.type === 'IMAGE' ? PALETTE['orange'] : PALETTE['blue']}
        onNodeHover={onNodeHover}/>
    </div>
  )

}