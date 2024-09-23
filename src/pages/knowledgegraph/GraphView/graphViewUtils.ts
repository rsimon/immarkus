import { NodeObject } from 'react-force-graph-2d';
import { Graph, GraphNode } from '../Types';

export const hasRelations = (node: NodeObject<GraphNode>, graph: Graph) => {
  const relations = graph.getLinks(node.id).filter(({ primitives }) =>
    primitives.some(p => 
      p.type === 'HAS_RELATED_ANNOTATION_IN' || 
      p.type === 'IS_RELATED_VIA_ANNOTATION'))

  return relations.length > 0;
}