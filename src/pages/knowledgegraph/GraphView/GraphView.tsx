import { useEffect, useRef } from 'react';
import { ForceGraph } from './ForceGraph';
import { GraphNode } from '../Graph';
import { useGraph } from './useGraph';

import './GraphView.css';

interface GraphViewProps {

  onSelect?(node: GraphNode): void;

}

export const GraphView = (props: GraphViewProps) => {

  const el = useRef<HTMLDivElement>(null);

  const graph = useGraph();

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