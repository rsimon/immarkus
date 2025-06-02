import murmur from 'murmurhash';
import { W3CAnnotation } from '@annotorious/react';
import { W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { EntityType, Folder, IIIFManifestResource, Image } from '@/model';
import { DataModelStore, Store } from '@/store';
import { GraphLink, GraphLinkPrimitive, GraphNode } from '../Types';
import { getEntityTypes } from '@/utils/annotation';
import { CozyManifest, CozyTOCNode } from 'cozy-iiif';

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

export const toManifestNodes = ({ id, manifest }: { id: string, manifest: CozyManifest}): GraphNode[] => {
  const manifestNode = {
    id: `iiif:${id}`,
    label: manifest.getLabel(),
    type: 'FOLDER'
  } as GraphNode;

  const toc = manifest.getTableOfContents();
  if (toc.root.length > 0) {
    const nodes = toc.enumerateNodes('range');
    return [
      manifestNode,
      ...nodes
        .filter(node =>
          // Don't include empty ToC nodes, or those with a single canvas
          node.navItems.length > 1 || node.navSections.length > 0)
        .map(node => ({
          id: `iiif:${id}@${murmur.v3(node.id)}`,
          label: node.getLabel(),
          type: 'FOLDER',
          properties: {
            navItems: node.navItems,
            navSections: node.navSections
          }
        } as unknown as GraphNode))
    ]
  } else {
    // Manifest without ToC
    return [manifestNode];
  }
}

export const toCanvasNodes = (manifest: IIIFManifestResource): GraphNode[] => 
  manifest.canvases.map(canvas => ({
    id: `iiif:${manifest.id}:${canvas.id}`,
    label: canvas.name,
    type: 'IMAGE',
  } as GraphNode));

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

export const getManifestStructurePrimitives = ({ id, manifest }: { id: string, manifest: CozyManifest }): GraphLinkPrimitive[] => {
  const toc = manifest.getTableOfContents();
  if (toc.root.length > 0) {
    const nodes = toc.enumerateNodes('range');

    const getId = (node: CozyTOCNode) => `iiif:${id}@${murmur.v3(node.id)}`;

    return nodes
      .filter(node => node.navItems.length > 1 || node.navSections.length > 0)
      .map(node => ({
        source: node.parent ? getId(node.parent) : `iiif:${id}`,
        target: getId(node),
        type: 'FOLDER_CONTAINS_SUBFOLDER'
      }))
  } else {
    // No ToC structure
    return [];
  }
}

export const getCanvasManifestPrimitives = ({ id, manifest }: { id: string, manifest: CozyManifest }): GraphLinkPrimitive[] => {
  const toc = manifest.getTableOfContents();

  const getId = (node: CozyTOCNode) => `iiif:${id}@${murmur.v3(node.id)}`;

  return manifest.canvases.map(canvas => {
    // Find the ToC node that this canvas belongs to
    const tocNode = toc.getNode(canvas.id);

    const source = 
      tocNode.parent?.navItems.length > 1 ? getId(tocNode.parent) :
      tocNode.parent?.parent ? getId(tocNode.parent.parent) :
      `iiif:${id}`; // Link to manifest directly

    const target = `iiif:${id}:${murmur.v3(canvas.id)}`;

    return {
      source,
      target,
      type: 'FOLDER_CONTAINS_IMAGE'
    } as GraphLinkPrimitive;
  });
}

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

export const getEntityAnnotationPrimitives = (annotatedImages: { sourceId: string; annotations: W3CAnnotation[]; }[]) =>
  annotatedImages.reduce<GraphLinkPrimitive[]>((all, { sourceId, annotations }) => {
      // n annotations on this image, each carrying 0 to m entity links
      const entityLinks = annotations.reduce<GraphLinkPrimitive[]>((all, annotation) => {
        if ('selector' in annotation.target) {
          const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];

          const source = sourceId.startsWith('iiif:') ? annotation.target.source : sourceId;

          const links: GraphLinkPrimitive[] = 
            bodies.filter(b => b.source).map(b => ({ 
              source, 
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
  annotatedImages: { sourceId: string; annotations: W3CAnnotation[]; }[], 
  store: Store
) => {
  // Returns the image for this annotation
  const findImage = (annotationId: string) =>
    annotatedImages
      .find(({ annotations }) => annotations.some(a => a.id === annotationId))?.sourceId;

  // Loop through each image...
  return annotatedImages.reduce<GraphLinkPrimitive[]>((all, { sourceId, annotations }) => {
    // ...get outbound relations for all annotations on this image
    const outboundRelations = annotations.reduce<GraphLinkPrimitive[]>((onThisImage, annotation) => {
      return [...onThisImage, ...store.getRelatedAnnotations(annotation.id, 'OUTBOUND').map(([link, meta]) => ({
        source: sourceId,
        target: findImage(link.body),
        type: 'HAS_RELATED_ANNOTATION_IN',
        value: getRelationName(meta),
        data: [link, meta]
      } as GraphLinkPrimitive))];
    }, []);

    return [...all, ...outboundRelations];
  }, []);
}

export const inferEntityToEntityRelationPrimitives = (
  annotatedImages: { sourceId: string; annotations: W3CAnnotation[]; }[],
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
          value: getRelationName(meta),
          data: [link, meta]
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

export const removeUnconnectedLinks = (links: GraphLink[], allNodes: GraphNode[]) => {
  const nodeIds = new Set(allNodes.map(n => n.id));
  return links.filter(l => {
    const isConnected = nodeIds.has(l.source) && nodeIds.has(l.target);
    // For diagnostic reasons
    // if (!isConnected) console.log(l);
    return isConnected;
  });
}
  