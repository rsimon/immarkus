import * as d3 from 'd3';
import { Graph, GraphLink, GraphNode } from '../Types';

interface DragEvent extends d3.D3DragEvent<SVGGElement, unknown, unknown> {

}

const drag = (simulation: d3.Simulation<GraphNode, GraphLink>) => {
  
  const dragstarted = (event: DragEvent, d: GraphNode) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  const dragged = (event: DragEvent, d: GraphNode) => {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  const dragended = (event: DragEvent, d: GraphNode) => {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
}

// Based on https://observablehq.com/@garciaguillermoa/force-directed-graph
export const ForceGraph = (graph: Graph, opts: {
  height: number,
  width: number,
  onSelect?(node?: GraphNode): void
}): SVGSVGElement => {
  const links = graph.links.map(d => Object.create(d));
  const nodes = graph.nodes.map(d => Object.create(d));

  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(opts.width / 2, opts.height / 2));

  const svg = d3.create('svg')
    .on('click', (event: MouseEvent, foo) => {
      const target = event.target as SVGElement;

      if (target.tagName.toLowerCase() !== 'circle' && opts.onSelect)
        opts.onSelect(undefined);
  });

  const container = svg.append('g');

  const link = container.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line');

  const node = container.append('g')
    .selectAll('.node')
    .data(nodes)
    .join('g')
      .attr('class', 'node')
      .call(drag(simulation));

  node.append('circle')
    .attr('r', 5)
    .attr('fill', n => n.type === 'IMAGE' ? 'rgb(230, 85, 13)' : 'rgb(158, 202, 225)')
    .attr('stroke', n => n.type === 'IMAGE' ? 'rgb(161, 59, 9)' : 'rgb(110, 141, 157)')
    .on('click', (_: MouseEvent, node: GraphNode) => {
      if (opts.onSelect) opts.onSelect(node);
    });
  
  node.append('text')
    .text(function(d) {
      return d.id;
    })
    .style('fill', '#000')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .attr('x', 10)
    .attr('y', 10);

  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node
      .attr('transform', d => `translate(${d.x}, ${d.y})`);
  });

  svg.call(d3.zoom().on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
    const{ transform } = event;

    container.attr('transform', transform.toString());

    // Counter scale relevant properties
    link.attr('stroke-width', `${1 / transform.k}`);

    node.selectAll('circle')
      .attr('r', 5 / transform.k)
      .attr('stroke-width', `${1 / transform.k}`);

    node.selectAll('text')
      .style('font-size', `${12 / transform.k}px`)
      .attr('x', 10 / transform.k)
      .attr('y', 10 / transform.k);
  }));

  return svg.node();
  
}