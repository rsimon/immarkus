import * as d3 from 'd3';
import { Graph, GraphLink, GraphNode } from '../Types';

interface MutableGraph {

  nodes: GraphNode[];

  links: GraphLink[];

}

interface MutableGraphNode extends GraphNode { x: number, y: number }

interface MutableGraphLink { source: MutableGraphNode, target: MutableGraphNode };

export const ForceGraph = (g: Graph, opts: {
  height: number,
  width: number,
  onSelect?(node?: GraphNode): void
}): SVGSVGElement => {

  var svg = svg = d3.create('svg');

  const graph: MutableGraph = {
    nodes: g.nodes.map(d => Object.create(d)),
    links: g.links.map(d => Object.create(d))
  };

  const simulation = d3.forceSimulation(graph.nodes)
    .force('link', d3.forceLink<GraphNode, GraphLink>(graph.links).id(d => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(opts.width / 2, opts.height / 2));
        
  var link = svg.selectAll('.link')
    .data(graph.links)
    .join('line')
    .classed('link', true)
    .style('stroke', '#aaa')
  
  var node = svg.selectAll('.node')
    .data(graph.nodes, n => n.id);
  
  var group = node.enter()
    .append('g')
    .attr('class', 'node');
  
  group.append('circle')
    .attr('r', 6)
    .style('fill', 'orange')
    .on('click', (_: MouseEvent, node: GraphNode) => {
      console.log('click!');
      toggle();
    });
  
  node.exit().remove()
  
  function update() {
    // update links
    link
      .data(graph.links);

    link.enter()
      .insert('line', '.node')
      .attr('class', 'link')
      .style('stroke', '#d9d9d9');
    link
      .exit()
      .remove();
      
    // update nodes
    var node = svg.selectAll('.node').data(graph.nodes, (n: GraphNode) => n.id);

    var nodeEnter = node.enter()
      .append('g')
      .attr('class', 'node');
    nodeEnter.append('circle')
      .attr("r", 6)
      .style("fill", "orange");

    node
      .exit()
      .remove();
      
    // update simulation
    simulation
      .nodes(graph.nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(graph.links).id(d => d.id))
      .force('charge', d3.forceManyBody())
      .restart()
  };

  const toggle = () => {
    const totalNodes = g.nodes.length;
    const renderedNodes = svg.selectAll('.node').size();

    if (renderedNodes === totalNodes) {
      // Randomly remove some nodes
      graph.nodes = g.nodes.filter(() => Math.random() > 0.5);
      
      const ids = new Set(graph.nodes.map(n => n.id));

      graph.links = g.links.filter(l => { 
        return ids.has(l.source) && ids.has(l.target);
      });

      update();
    } else {
      graph.nodes = g.nodes.map(d => Object.create(d));
      graph.links = g.links.map(d => Object.create(d));
      update();
    }
  }

  simulation.on('tick', () => {
    svg.selectAll('.link')
      .attr('x1', (d: MutableGraphLink) => d.source.x)
      .attr('y1', (d: MutableGraphLink) => d.source.y)
      .attr('x2', (d: MutableGraphLink) => d.target.x)
      .attr('y2', (d: MutableGraphLink) => d.target.y);
      
    svg.selectAll('.node')
      .attr('transform',  (d: MutableGraphNode) => `translate(${d.x},${d.y})`);
  })


  return svg.node();

}