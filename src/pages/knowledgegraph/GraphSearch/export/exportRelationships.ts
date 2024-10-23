import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { Graph, GraphLinkPrimitive, GraphNode } from '../../Types';

export const getRelationships = (
  graph: Graph, 
  nodes: GraphNode[]
) => {
  // Returns all relationship primitives linked to this (image or entity class) node.
  const getRelationPrimitives = (node: GraphNode) => {
    const links = graph.getLinks(node.id);
    return links.reduce<GraphLinkPrimitive[]>((all, link) => {
      return [
        ...all, 
        ...link.primitives.filter(({ type }) => 
          type === 'HAS_RELATED_ANNOTATION_IN' || type === 'IS_RELATED_VIA_ANNOTATION')
      ]
    }, []);
  }

  // All relationship primitives, on all nodes in the matched set
  const relationshipPrimitives = nodes.reduce<GraphLinkPrimitive[]>((all, node) => 
    ([...all, ...getRelationPrimitives(node)]), []);

  // Distinct relationships
  const relationships = relationshipPrimitives.reduce<[W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][]>((all, p) => {
    const [link, meta] = p.data || [undefined, undefined];

    if (!link) return all; // Should never happen

    // Note that primitives generally appear twice (on source and target node) - de-duplicate!
    const existing = all.find(t => t[0].id === link.id);
    if (existing) {
      return all;
    } else {
      return [...all, [link, meta]];
    }
  }, []);

  return relationships;
}