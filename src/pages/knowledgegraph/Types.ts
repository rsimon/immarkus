export interface Graph {

  getLinkedNodes(nodeId: string): GraphNode[];

  getNeighbourhood(nodeId: string, hops: number): GraphNode[];

  links: GraphLink[];

  maxDegree: number;

  maxLinkWeight: number;

  minDegree: number;

  minLinkWeight: number;

  nodes: GraphNode[];

}

export interface GraphNode {

  id: string;

  label: string;

  type: 'FOLDER' | 'IMAGE' | 'ENTITY_TYPE';

  degree: number;

  properties?: {

    [key: string]: string;
    
  }
  
}

export interface GraphLink {

  source: string;
  
  target: string;
  
  value: number

}

export interface KnowledgeGraphSettings {

  hideIsolatedNodes?: boolean;

  hideLabels?: boolean;

  includeFolders?: boolean;

  relationsOnly?: boolean;

}
