import { useEffect, useRef } from 'react';
import { ForceGraph } from './ForceGraph';
import { Graph, GraphNode } from '../Types';
import { useGraph } from './useGraph';

import './GraphView.css';

interface GraphViewProps {

  graph: Graph;

  onSelect?(node: GraphNode): void;

}

export const GraphView = (props: GraphViewProps) => {

  const { graph } = props;

  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!graph) return;

    const { clientWidth, clientHeight } = el.current;

    const svg = ForceGraph(graph, {
      height: clientHeight,
      width: clientWidth,
      onSelect: props.onSelect
    });
    
    while (el.current.firstChild)
      el.current.removeChild(el.current.lastChild);
    
    el.current.appendChild(svg);
  }, [graph]);

  return (
    <div 
      ref={el} 
      className="knowledge-graph-container w-full h-full" />
  )

}