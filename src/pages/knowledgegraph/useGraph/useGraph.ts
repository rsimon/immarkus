import { useEffect, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { Image } from '@/model';
import { useStore } from '@/store';
import { Graph, GraphLink, GraphNode, KnowledgeGraphSettings } from '../Types';
import { getEntityHierarchyPrimitives, getFolderStructurePrimitives, getImageFolderPrimitives, toEntityTypeNode, toFolderNode, toImageNode } from './graphBuilderUtils';

export const useGraph = (settings: KnowledgeGraphSettings) => {

  const store = useStore();

  const datamodel = store.getDataModel();

  const [annotations, setAnnotations] = useState<{ image: Image, annotations: W3CAnnotation[] }[]>([]);

  const [graph, setGraph] = useState<Graph>();

  const { images, folders } = store;

  const { includeFolders, graphMode } = settings;
  
  useEffect(() => {
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

        /** Nodes (folders, images, entity types) **/
        const nodes: GraphNode[] = [
          ...(includeFolders ? folders.map(f => toFolderNode(f, folderMetadata)) : []),
          ...images.map(i => toImageNode(i, imageMetadata)),
          ...datamodel.entityTypes.map(toEntityTypeNode)
        ];

        /** Links **/

        // Links between folders & subfolderss
        const folderStructurePrimitives = includeFolders ? getFolderStructurePrimitives(folders, store): [];

        // Links between images and subfolders
        const imageFolderPrimitives = includeFolders ? getImageFolderPrimitives(images, store) : [];

        // Parent-child model hierarchy links between entity classes
        const entityHierarchyPrimitives = graphMode === 'HIERARCHY' ? getEntityHierarchyPrimitives(datamodel) : [];

        // Links between images and entity types
        const entityAnnotationPrimitives =
          imagesResult.reduce<GraphLink[]>((all, { annotations, image }) => {
            // N annotations on this image, each carrying 0 to M entity links
            const entityLinks = annotations.reduce<GraphLink[]>((all, annotation) => {
              if ('selector' in annotation.target) {
                const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    
                const links: GraphLink[] = 
                  bodies.filter(b => b.source).map(b => ({ source: image.id, target: b.source, value: 1 }));
                
                return [...all, ...links ];
              } else {
                // Not an image annotation
                return all;
              }
            }, []);

            return [...all, ...entityLinks];
        }, []);

        /*
        const resolvedRelations = relations.listRelations().reduce<ResolvedRelation[]>((all, r) => (
          [...all, ...relations.resolveTargets(r)]
        ), []);
        */

        /* Links between images based on relations (with value = no. of annotations)
        const relationImageLinks = graphMode === 'RELATIONS'? resolvedRelations.reduce<GraphLink[]>((all, r) => {
          const existing = all.find(l => { 
            return l.source === r.image.id && l.target === r.targetImage.id;
          });

          if (existing) {
            return all.map(l => l === existing ? ({
              ...l,
              value: l.value + 1
            } as GraphLink) : l)
          } else {
            return [...all, { source: r.image.id, target: r.targetImage.id, value: 1, type: 'RELATION' } as GraphLink]
          }
        }, []) : [];
        */

        /* Connect entity classes that were connected through annotations
        const relationEntityLinks = graphMode === 'RELATIONS' ? relations.listRelations().reduce<GraphLink[]>((all, r) => {
          const existing = all.find(l => { 
            return l.source === r.sourceEntityType && l.target === r.targetEntityType;
          });

          if (existing) {
            return all.map(l => l === existing ? ({
              ...l,
              value: l.value + 1
            } as GraphLink) : l)
          } else {
            return [...all, { source: r.sourceEntityType, target: r.targetEntityType, value: 1, type: 'RELATION' } as GraphLink]
          }
        }, []) : [];
        */

        const primitives = [
          ...folderStructurePrimitives, 
          ...imageFolderPrimitives, 
          ...entityHierarchyPrimitives, 
          ...entityAnnotationPrimitives
          // ...relationImageLinks,
          // ...relationEntityLinks
        ];

        // Flatten links
        const links = primitives.reduce<GraphLink[]>((agg, link) => {
          const existing = agg.find(l => l.source === link.source && l.target === link.target);
          if (existing) {
            return agg.map(l => l === existing ? { ...existing, value: existing.value + 1 } : l);
          } else {
            return [...agg, link];
          }
        }, []);

        let minLinkWeight = flattened.length === 0 ? 0 : Infinity;

        let maxLinkWeight = 1;

        flattened.forEach(link => {
          if (link.weight > maxLinkWeight)
            maxLinkWeight = link.weight;

          if (link.weight < minLinkWeight)
            minLinkWeight = link.weight;
        });

        /**
         * Returns nodes connected to this node through a direct link.
         */
        const getLinkedNodes = (nodeId: string) => {
          // Note that we don't expect links that connect a node to itself here!
          const linkedIds = flattened
            .filter(l => l.source === nodeId || l.target === nodeId)
            .map(l => l.source === nodeId ? l.target : l.source);

          return linkedIds.map(id => nodes.find(n => n.id === id));
        }

        /**
         * Returns nodes connected to this node through the given number
         * of hops. If hops is 1, this will return the same as getLinkedNodes.
         */
        const getNeighbourhood = (nodeId: string, hops: number) => {
          if (hops < 1) return [];

          if (hops === 1) return getLinkedNodes(nodeId);

          // TODO
          return [];
        }

        const computeDegree = (node: GraphNode) => {
          const links = flattened.filter(l => l.target === node.id || l.source === node.id);
          const degree = links.reduce((total, link) => total + link.weight, 0);
          return {...node, degree };
        }

        const nodesWithDegree = nodes.map(computeDegree);

        // Record minimum & maximum number of links per node
        let minDegree = imagesResult.length === 0 ? 0 : Infinity;

        let maxDegree = 0;

        nodesWithDegree.forEach(n => {
          if (n.degree > maxDegree)
            maxDegree = n.degree; 

          if (n.degree < minDegree)
            minDegree = n.degree;
        });

        setGraph({ 
          getLinkedNodes,
          getNeighbourhood,
          nodes: nodesWithDegree,
          links: flattened.map(l => ({ ...l })),
          minDegree, 
          maxDegree,
          minLinkWeight,
          maxLinkWeight
        });

        setAnnotations(imagesResult);
      });
    });
  }, [graphMode, includeFolders]);

  return { annotations, graph };

}