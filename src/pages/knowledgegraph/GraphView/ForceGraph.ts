import * as d3 from 'd3';
import { PALETTE } from './Palette';
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

const NODE_STROKE_WIDTH = 1.5;

const MAX_NODE_SIZE = 10;
const MIN_NODE_SIZE = 5;

const MAX_LINK_WIDTH = 3;
const MIN_LINK_WIDTH = 1;

const LABEL_OFFSET_X = 12;
const LABEL_OFFSET_Y = 12;

// Based on https://observablehq.com/@garciaguillermoa/force-directed-graph
export const ForceGraph = (graph: Graph, opts: {
  height: number,
  width: number,
  onSelect?(node?: GraphNode): void
}): SVGSVGElement => {
  const links = graph.links.map(d => Object.create(d));
  const nodes = graph.nodes.map(d => Object.create(d));

  // Node size scaling factor
  const nodeScale = (MAX_NODE_SIZE - MIN_NODE_SIZE) / (graph.maxDegree - graph.minDegree);

  // Link stroke width scaling factor
  const linkScale = (MAX_LINK_WIDTH - MIN_LINK_WIDTH) / (graph.maxLinkWeight - graph.minLinkWeight);

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
    .join('line')
      .attr('stroke-width', n => linkScale * n.value + MIN_LINK_WIDTH)

  const node = container.append('g')
    .selectAll('.node')
    .data(nodes)
    .join('g')
      .attr('class', 'node')
      .call(drag(simulation));

  node.append('circle')
    .attr('stroke', '#fff')
    .attr('stroke-width', NODE_STROKE_WIDTH)
    .attr('r', n => nodeScale * n.degree + MIN_NODE_SIZE)
    .attr('fill', n => n.type === 'IMAGE' ? PALETTE['orange'] : PALETTE['blue'])
    .on('click', (_: MouseEvent, node: GraphNode) => {
      if (opts.onSelect) opts.onSelect(node);
    });
  
  node.append('text')
    .text(function(d) {
      return d.label
    })
    .style('fill', '#000')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .attr('x', LABEL_OFFSET_X)
    .attr('y', LABEL_OFFSET_Y);

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
    link.attr('stroke-width', 
      (n: GraphLink) => `${(linkScale * n.value + MIN_LINK_WIDTH) / transform.k}`);

    node.selectAll('circle')
      .attr('r', (n: GraphNode) => (nodeScale * n.degree + MIN_NODE_SIZE) / transform.k)
      .attr('stroke-width', `${NODE_STROKE_WIDTH / transform.k}`);

    node.selectAll('text')
      .style('font-size', `${12 / transform.k}px`)
      .attr('x', LABEL_OFFSET_X / transform.k)
      .attr('y', LABEL_OFFSET_Y / transform.k);
  }));

  return svg.node();
  
}