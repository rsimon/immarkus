import { useEffect, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { Image } from '@/model';
import { useStore } from '@/store';
import { Graph, GraphLink, GraphNode, KnowledgeGraphSettings } from '../Types';
import { 
  getEntityAnnotationPrimitives, 
  getEntityHierarchyPrimitives, 
  getFolderStructurePrimitives, 
  getImageFolderPrimitives, 
  inferEntityToEntityRelationPrimitives, 
  inferImageToImageRelationPrimitives, 
  toEntityTypeNode, 
  toFolderNode, 
  toImageNode 
} from './graphBuilderUtils';

export const useGraph = (settings: KnowledgeGraphSettings) => {

  const store = useStore();

  const datamodel = store.getDataModel();

  const [annotations, setAnnotations] = useState<{ image: Image, annotations: W3CAnnotation[] }[]>([]);

  const [graph, setGraph] = useState<Graph>();

  const { images, folders } = store;

  const { includeFolders, graphMode } = settings;
  
  useEffect(() => {
    // Store node ID -> graph links lookup table for performance
    const linkMap = new Map<string, GraphLink[]>();

    // Resolve folder metadata and image annotations asynchronously
    const foldersQuery = folders.map(folder =>
      store.getFolderMetadata(folder.id).then(metadata => ({ metadata, folder })));

    const imagesQuery = images.map(image => 
      store.getAnnotations(image.id).then(annotations => ({ annotations, image })));

    Promise.all(foldersQuery).then(foldersResult => {
      const folderMetadata: Map<string, W3CAnnotation> = new Map(foldersResult
        .map(({ folder, metadata }) => ([folder.id, metadata] as [string, W3CAnnotation]))
        .filter(t => t[1]));

      Promise.all(imagesQuery).then(imagesResult => {
        const imageMetadata: Map<string, W3CAnnotation> = new Map(imagesResult
          .map(({ image, annotations }) => ([
            image.id, 
            annotations.find(a => (typeof a.target === 'object' && 'selector' in a.target))
          ] as [string, W3CAnnotation]))
          .filter(t => t[1]));

        /** 
         * Nodes (folders, images, entity types) 
         */
        const nodesWithoutDegree: GraphNode[] = [
          ...(includeFolders ? folders.map(f => toFolderNode(f, folderMetadata)) : []),
          ...images.map(i => toImageNode(i, imageMetadata)),
          ...datamodel.entityTypes.map(toEntityTypeNode)
        ];

        /** 
         * Link primitives (which will be aggregated to links below)
         */

        // Links between folders & subfolderss
        const folderStructurePrimitives = includeFolders ? getFolderStructurePrimitives(store): [];

        // Links between images and subfolders
        const imageFolderPrimitives = includeFolders ? getImageFolderPrimitives(store) : [];

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
          ...entityHierarchyPrimitives, 
          ...entityAnnotationPrimitives,
          ...imageToImageRelationPrimitives,
          ...entityToEntityRelationPrimitives
        ];

        /** 
         * Links (aggregated from link primitives)
         */

        const links = primitives.reduce<GraphLink[]>((agg, primitive) => {
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

        // Cache nodeId -> links associations for fast lookups
        links.forEach(link => {
          const { source, target } = link;

          const sourceLinks = linkMap.get(source);
          linkMap.set(source, [...(sourceLinks || []), link]);
          
          const targetLinks = linkMap.get(target);
          linkMap.set(target, [...(targetLinks || []), link]);
        });

        /** 
         * Compute min and max link weights 
         */

        let minLinkWeight = links.length === 0 ? 0 : Infinity;

        let maxLinkWeight = 1;

        links.forEach(link => {
          if (link.weight > maxLinkWeight)
            maxLinkWeight = link.weight;

          if (link.weight < minLinkWeight)
            minLinkWeight = link.weight;
        });

        /** 
         * Now that we have weighted links, compute node degree
         */

        const nodes = nodesWithoutDegree.map((node: GraphNode) => {
          const onThisNode = links.filter(l => l.target === node.id || l.source === node.id);
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
          // Note that we don't expect links that connect a node to itself here!
          const linkedIds = links
            .filter(l => l.source === nodeId || l.target === nodeId)
            .map(l => l.source === nodeId ? l.target : l.source);

          return linkedIds.map(id => nodes.find(n => n.id === id));
        }

        setGraph({ 
          getLinkedNodes,
          getLinks,
          nodes,
          links: links.map(l => ({ ...l })),
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