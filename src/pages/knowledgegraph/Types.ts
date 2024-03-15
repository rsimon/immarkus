import * as d3 from 'd3';

export interface Graph {

  getLinkedNodes(nodeId: string): GraphNode[];

  links: GraphLink[];

  maxDegree: number;

  maxLinkWeight: number;

  minDegree: number;

  minLinkWeight: number;

  nodes: GraphNode[];

}

export interface GraphNode extends d3.SimulationNodeDatum {

  id: string;

  label: string;

  type: 'IMAGE' | 'ENTITY_TYPE';

  degree: number;
  
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {

  source: string;
  
  target: string;
  
  value: number

}