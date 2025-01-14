import { useEffect, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { IIIFManifestResource, Image } from '@/model';
import { useStore } from '@/store';
import { Graph, GraphLink, GraphNode, KnowledgeGraphSettings } from '../Types';
import { 
  aggregatePrimitives,
  getCanvasManifestPrimitives,
  getEntityAnnotationPrimitives,
  getEntityHierarchyPrimitives, 
  getFolderStructurePrimitives, 
  getImageFolderPrimitives, 
  inferEntityToEntityRelationPrimitives, 
  inferImageToImageRelationPrimitives, 
  removeUnconnectedLinks, 
  toCanvasNodes, 
  toEntityTypeNode, 
  toFolderNode, 
  toImageNode,
  toManifestNode 
} from './graphBuilderUtils';

export const useGraph = (settings: KnowledgeGraphSettings) => {

  const store = useStore();

  const datamodel = store.getDataModel();

  const [annotations, setAnnotations] = useState<{ sourceId: string, annotations: W3CAnnotation[] }[]>([]);

  const [graph, setGraph] = useState<Graph>();

  const { images, iiifResources, folders } = store;

  const { includeFolders, graphMode } = settings;
  
  useEffect(() => {
    // Store node ID -> graph links lookup table for performance
    const linkMap = new Map<string, GraphLink[]>();

    // Resolve folder metadata and image annotations asynchronously
    const foldersQuery = folders.map(folder =>
      store.getFolderMetadata(folder.id).then(metadata => ({ metadata, folder })));

    const canvasIds = iiifResources.reduce<string[]>((all, manifest) => (
      [...all, ...(manifest as IIIFManifestResource).canvases.map(c => `iiif:${c.manifestId}:${c.id}`)]
    ), []);

    const annotationsQuery = [
      ...images.map(i => i.id),
      ...canvasIds
    ].map(sourceId => store.getAnnotations(sourceId).then(annotations => ({ annotations, sourceId })));

    Promise.all(foldersQuery).then(foldersResult => {
      const folderMetadata: Map<string, W3CAnnotation> = new Map(foldersResult
        .map(({ folder, metadata }) => ([folder.id, metadata] as [string, W3CAnnotation]))
        .filter(t => t[1]));

      Promise.all(annotationsQuery).then(imagesResult => {
        const imageMetadata: Map<string, W3CAnnotation> = new Map(imagesResult
          .map(({ sourceId, annotations }) => ([
            sourceId, 
            annotations.find(a => (typeof a.target === 'object' && !('selector' in a.target)))
          ] as [string, W3CAnnotation]))
          .filter(t => t[1]));

        /** 
         * Nodes (folders, images, entity types) 
         */
        const nodesWithoutDegree: GraphNode[] = [
          ...(includeFolders ? folders.map(f => toFolderNode(f, folderMetadata)) : []),
          ...(includeFolders ? iiifResources.map(r => toManifestNode(r)) : []),
          ...images.map(i => toImageNode(i, imageMetadata)),
          ...iiifResources.reduce<GraphNode[]>((all, r) => [...all, ...toCanvasNodes(r as IIIFManifestResource)], []),
          ...datamodel.entityTypes.map(toEntityTypeNode)
        ];

        /** 
         * Link primitives (which will be aggregated to links below)
         */

        // Links between folders & subfolderss
        const folderStructurePrimitives = includeFolders ? getFolderStructurePrimitives(store): [];

        // Links between images and subfolders
        const imageFolderPrimitives = includeFolders ? getImageFolderPrimitives(store) : [];

        // Links between manifests and canvases
        const canvasManifestPrimitives = includeFolders ? getCanvasManifestPrimitives(iiifResources): [];

        // Parent-child model hierarchy links between entity classes
        const entityHierarchyPrimitives = graphMode === 'HIERARCHY' ? getEntityHierarchyPrimitives(datamodel) : [];

        // Links between images and entity types
        const entityAnnotationPrimitives = getEntityAnnotationPrimitives(imagesResult);

        // Links between images, mediated by relations
        const imageToImageRelationPrimitives = graphMode === 'RELATIONS' 
          ? inferImageToImageRelationPrimitives(imagesResult, store)
          : [];

        const entityToEntityRelationPrimitives = graphMode === 'RELATIONS'
          ? inferEntityToEntityRelationPrimitives(imagesResult, store)
          : [];

        const primitives = [
          ...folderStructurePrimitives, 
          ...imageFolderPrimitives, 
          ...canvasManifestPrimitives,
          ...entityHierarchyPrimitives, 
          ...entityAnnotationPrimitives,
          ...imageToImageRelationPrimitives,
          ...entityToEntityRelationPrimitives
        ];

        /** 
         * Links (aggregated from link primitives)
         */
        const links = aggregatePrimitives(primitives);

        // Cache nodeId -> links associations for fast lookups
        links.forEach(link => {
          const { source, target } = link;

          const sourceLinks = linkMap.get(source);
          linkMap.set(source, [...(sourceLinks || []), link]);
          
          const targetLinks = linkMap.get(target);
          linkMap.set(target, [...(targetLinks || []), link]);
        });

        /** 
         * After filtering, we want to drop any links that are no longer connected to nodes.
         * This is particularly relevant for RELATIONS mode (because the filtering will have 
         * deliberately removed nodes). But it is also necessary in HIERARCHY mode, as a general 
         * sanitization measure, because users may have annotations in their data which point
         * to entity classes that were deleted from the data model.
         */
        const linksFiltered = removeUnconnectedLinks(links, nodesWithoutDegree);

        /** 
         * Compute min and max link weights 
         */
        let minLinkWeight = linksFiltered.length === 0 ? 0 : Infinity;

        let maxLinkWeight = 1;

        linksFiltered.forEach(link => {
          if (link.weight > maxLinkWeight)
            maxLinkWeight = link.weight;

          if (link.weight < minLinkWeight)
            minLinkWeight = link.weight;
        });

        /** 
         * Now that we have weighted links, compute node degree
         */

        const nodes = nodesWithoutDegree.map((node: GraphNode) => {
          const onThisNode = linksFiltered.filter(l => l.target === node.id || l.source === node.id);
          const degree = onThisNode.reduce((total, link) => total + link.weight, 0);
          return { ...node, degree };
        });

        let minNodeDegree = imagesResult.length === 0 ? 0 : Infinity;

        let maxNodeDegree = 0;

        nodes.forEach(n => {
          if (n.degree > maxNodeDegree)
            maxNodeDegree = n.degree; 

          if (n.degree < minNodeDegree)
            minNodeDegree = n.degree;
        });
      
        /** 
         * Graph utility functions
         */

        const getLinks = (nodeId: string) => [...(linkMap.get(nodeId) || [])];

        /** Returns nodes connected to this node through a direct link. **/
        const getLinkedNodes = (nodeId: string) => {
          // Note that we ignore links that connect a node to itself here!
          const links = linkMap.get(nodeId) || [];
        
          // Note that the linkMap may include nodes that were filtered out later!
          const neighbourIds = new Set(links.reduce<string[]>((all, link) => (
            [...all, link.source, link.target]
          ), []));
        
          return nodes.filter(n => neighbourIds.has(n.id));
        }

        setGraph({ 
          getLinkedNodes,
          getLinks,
          nodes,
          links: linksFiltered.map(l => ({ ...l })),
          minDegree: minNodeDegree, 
          maxDegree: maxNodeDegree,
          minLinkWeight,
          maxLinkWeight
        });

        setAnnotations(imagesResult);
      });
    });
  }, [graphMode, includeFolders]);

  return { annotations, graph };

}