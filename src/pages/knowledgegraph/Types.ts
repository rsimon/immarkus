import * as d3 from 'd3';

export interface Graph {

  nodes: GraphNode[];

  links: GraphLink[];

  minDegree: number;

  maxDegree: number;

}

export interface GraphNode extends d3.SimulationNodeDatum {

  id: string;

  type: 'IMAGE' | 'ENTITY_TYPE';

  degree: number;
  
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {

  source: string;
  
  target: string;
  
  value?: number

}