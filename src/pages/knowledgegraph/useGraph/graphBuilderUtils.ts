import { W3CAnnotation } from '@annotorious/react';
import { W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { EntityType, Folder, Image } from '@/model';
import { DataModelStore, Store } from '@/store';
import { GraphLink, GraphLinkPrimitive, GraphNode } from '../Types';
import { getEntityTypes } from '@/utils/annotation';

export const toFolderNode = (folder: Folder, metadata: Map<string, W3CAnnotation>): GraphNode => ({
  id: folder.id,
  label: folder.name,
  type: 'FOLDER',
  properties: (metadata.get(folder.id)?.body as any)?.properties
} as GraphNode);

export const toImageNode = (image: Image, metadata: Map<string, W3CAnnotation>): GraphNode => ({
  id: image.id, 
  label: image.name,
  type: 'IMAGE', 
  properties: (metadata.get(image.id)?.body as any)?.properties 
} as GraphNode);

export const toEntityTypeNode = (type: EntityType): GraphNode => ({
  id: type.id, 
  label: type.label || type.id,
  type: 'ENTITY_TYPE',
} as GraphNode);

export const getFolderStructurePrimitives = (store: Store) =>
  store.folders.reduce<GraphLinkPrimitive[]>((all, folder) => {
    if (folder.parent) {
      const parent = store.getFolder(folder.parent);
      if (parent && 'id' in parent) {
        return [...all, { 
          source: parent.id, 
          target: folder.id,
          type: 'FOLDER_CONTAINS_SUBFOLDER'
        } as GraphLinkPrimitive]
      } else {
        return all;
      }
    } else {
      return all;
    }
  }, []);

export const getImageFolderPrimitives = (store: Store) =>
  store.images.reduce<GraphLinkPrimitive[]>((all, image) => {
    const parentFolder = store.getFolder(image.folder);
    if ('id' in parentFolder) {
      return [...all, { 
        source: parentFolder.id, 
        target: image.id,
        type: 'FOLDER_CONTAINS_IMAGE'
      } as GraphLinkPrimitive]
    } else {
      return all;
    }
  }, []);

export const getEntityHierarchyPrimitives = (model: DataModelStore) =>
  model.entityTypes.reduce<GraphLinkPrimitive[]>((all, type) => {
    if (type.parentId) {
      // Being defensive... make sure the parent ID actually exists
      const parent = model.getEntityType(type.parentId);
      if (parent) {
        // Create link from parent to this entity
        return [...all, { 
          source: parent.id, 
          target: type.id,
          type: 'IS_PARENT_TYPE_OF'
        } as GraphLinkPrimitive];
      } else {
        return all;
      }
    } else {
      return all;
    }
  }, []);

export const getEntityAnnotationPrimitives = (annotatedImages: { image: Image; annotations: W3CAnnotation[]; }[]) =>
  annotatedImages.reduce<GraphLinkPrimitive[]>((all, { annotations, image }) => {
      // n annotations on this image, each carrying 0 to m entity links
      const entityLinks = annotations.reduce<GraphLinkPrimitive[]>((all, annotation) => {
        if ('selector' in annotation.target) {
          const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];

          const links: GraphLinkPrimitive[] = 
            bodies.filter(b => b.source).map(b => ({ 
              source: image.id, 
              target: b.source,
              type: 'HAS_ENTITY_ANNOTATION'
            }));
          
          return [...all, ...links ];
        } else {
          // Not an image annotation
          return all;
        }
      }, []);

      return [...all, ...entityLinks];
  }, []);

const getRelationName = (a: W3CRelationMetaAnnotation) => {
  const body = Array.isArray(a.body) ? a.body[0] : a.body;
  return body?.value;
}

export const inferImageToImageRelationPrimitives = (
  annotatedImages: { image: Image; annotations: W3CAnnotation[]; }[], 
  store: Store
) => {
  // Returns the image for this annotation
  const findImage = (annotationId: string) =>
    annotatedImages
      .find(({ annotations }) => annotations.some(a => a.id === annotationId))?.image;

  // Loop through each image...
  return annotatedImages.reduce<GraphLinkPrimitive[]>((all, { image, annotations }) => {
    // ...get outbound relations for all annotations on this image
    const outboundRelations = annotations.reduce<GraphLinkPrimitive[]>((onThisImage, annotation) => {
      return [...onThisImage, ...store.getRelatedAnnotations(annotation.id, 'OUTBOUND').map(([link, meta]) => ({
        source: image.id,
        target: findImage(link.body)?.id,
        type: 'HAS_RELATED_ANNOTATION_IN',
        value: getRelationName(meta)
      } as GraphLinkPrimitive))];
    }, []);

    return [...all, ...outboundRelations];
  }, []);
}

export const inferEntityToEntityRelationPrimitives = (
  annotatedImages: { image: Image; annotations: W3CAnnotation[]; }[],
  store: Store
) => {
  // All annotations as a flat list
  const allAnnotations = 
    annotatedImages
      .reduce<W3CAnnotation[]>((all, { annotations }) => ([...all, ...annotations]), []);

  // All relations
  const allRelations = store.listAllRelations();

  const getEntityTypesForAnnotation = (annotationId: string) => {
    const annotation = allAnnotations.find(a => a.id === annotationId);
    return getEntityTypes(annotation);
  }

  return allRelations.reduce<GraphLinkPrimitive[]>((all, [link, meta]) => {
    const inTypes = getEntityTypesForAnnotation(link.body);
    const outTypes = getEntityTypesForAnnotation(link.target);

    if (inTypes.length === 0 || outTypes.length === 0) {
      // No entity connection mediated through this relation
      return all;
    } else {
      // There are one or more in-, and one or more out-types - enumerate
      const forThisLink = outTypes.reduce<GraphLinkPrimitive[]>((all, outType) => {
        const inbound = inTypes.map(inType => ({
          source: outType,
          target: inType,
          type: 'IS_RELATED_VIA_ANNOTATION',
          value: getRelationName(meta)
        } as GraphLinkPrimitive));

        return [...all, ...inbound];
      }, []);

      return [...all, ...forThisLink];
    }
  }, []);

}

export const aggregatePrimitives = (primitives: GraphLinkPrimitive[]): GraphLink[] => 
  primitives.reduce<GraphLink[]>((agg, primitive) => {
    const existingLink = agg.find(l => l.source === primitive.source && l.target === primitive.target);
    if (existingLink) {
      return agg.map(l => l === existingLink ? { 
        ...existingLink, 
        weight: existingLink.weight + 1,
        primitives: [...existingLink.primitives, primitive]
      } : l);
    } else {
      return [...agg, {
        source: primitive.source,
        target: primitive.target,
        weight: 1,
        primitives: [primitive]
      } as GraphLink];
    }
  }, []);

// Returns true if the node has any relation links.
export const hasRelations = (node: GraphNode, linkMap: Map<string, GraphLink[]>) => {
  const links = linkMap.get(node.id) || [];

  return links.some(l => l.primitives.some(p => 
    p.type === 'HAS_RELATED_ANNOTATION_IN' || 
    p.type === 'IS_RELATED_VIA_ANNOTATION'));
}

/** Returns nodes connected to this node through a direct link. **/
export const getNeighbours = (nodeId: string, allNodes: GraphNode[], linkMap: Map<string, GraphLink[]>) => {
  // Note that we ignore links that connect a node to itself here!
  const links = linkMap.get(nodeId) || [];

  const neighbourIds = new Set(links.reduce<string[]>((all, link) => (
    [...all, link.source, link.target]
  ), []));

  return allNodes.filter(n => neighbourIds.has(n.id));
}

// Returns true if this node is connected to a neighbour that has a relation link
const hasNeighbourWithRelation = (node: GraphNode, allNodes: GraphNode[], linkMap: Map<string, GraphLink[]>) => {
  const neighbours = getNeighbours(node.id, allNodes, linkMap);
  return neighbours.some(n => hasRelations(n, linkMap));
}

export const filterRelationGraphNodes = (nodes: GraphNode[], linkMap: Map<string, GraphLink[]>) =>
  nodes.filter(node => hasRelations(node, linkMap) || hasNeighbourWithRelation(node, nodes, linkMap));

export const removeUnconnectedLinks = (links: GraphLink[], allNodes: GraphNode[]) => {
  const nodeIds = new Set(allNodes.map(n => n.id));
  return links.filter(l => {
    const isConnected = nodeIds.has(l.source) && nodeIds.has(l.target);
    // For diagnostic reasons
    // if (!isConnected) console.log(l);
    return isConnected;
  });
}
  