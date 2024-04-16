import { useEffect, useState } from 'react';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { EntityType, Folder, Image } from '@/model';
import { useStore } from '@/store';
import { Graph, GraphLink, GraphNode } from './Types';

export const useGraph = (includeFolders?: boolean) => {

  const store = useStore();

  const datamodel = store.getDataModel();

  const [graph, setGraph] = useState<Graph>();

  const { images, folders } = store;

  const promises = images.map(image => 
    store.getAnnotations(image.id).then(annotations => ({ annotations, image })));

  useEffect(() => {
    Promise.all(promises).then(result => {
      const imageAnnotations = result.reduce<W3CAnnotation[]>((all, { annotations }) => (
        [...all, ...annotations.filter(a => 'selector' in a.target)]
      ), []);

      const metadata: Map<string, W3CAnnotation> = new Map(result
        .map(({ image, annotations }) => 
            ([image.id, annotations.find(a => !('selector' in a.target))] as [string, W3CAnnotation]))
        .filter(t => t[1]));

      const entityBodies = imageAnnotations.reduce<W3CAnnotationBody[]>((all, annotation) => (
        [...all, ...(Array.isArray(annotation.body) ? annotation.body : [annotation.body])]
      ), []).filter(b => b.source);

      const getFolderDegree = (folder: Folder) => {
        const { folders, images } = store.getFolderContents(folder.handle);
        return folders.length +  images.length + (folder.parent ? 1 : 0);
      }

      const getImageDegree = (image: Image) => {
        const annotations = result.find(t => t.image.id === image.id).annotations;

        const entityIds = new Set(annotations
          .reduce<W3CAnnotationBody[]>((all, annotation) => (
            [...all, ...(Array.isArray(annotation.body) ? annotation.body : [annotation.body])]
          ), [])
          .filter(b => b.source)
          .map(b => b.source));

        const isSubFolder = 'id' in store.getFolder(image.folder);

        return includeFolders 
          // Add degree of one, if we are displaying folder links
          ? entityIds.size + (isSubFolder ? 1 : 0)
          : entityIds.size;
      }

      const getEntityTypeDegree = (type: EntityType) => {
        const images = entityBodies.filter(b => b.source === type.id).length;
        const childTypes = datamodel.getChildTypes(type.id).length;
        return type.parentId ? images + childTypes + 1 : images + childTypes;
      }

      const nodes: GraphNode[] = [
        ...(includeFolders ? folders.map(folder => ({
          id: folder.id,
          label: folder.name,
          type: 'FOLDER',
          degree: getFolderDegree(folder),
        } as GraphNode)) : []),

        ...images.map(image => ({ 
            id: image.id, 
            label: image.name,
            type: 'IMAGE', 
            degree: getImageDegree(image),
            properties: (metadata.get(image.id)?.body as any)?.properties 
          } as GraphNode)),

        ...datamodel.entityTypes.map(type => ({ 
            id: type.id, 
            label: type.label || type.id,
            type: 'ENTITY_TYPE',
            degree: getEntityTypeDegree(type)
          } as GraphNode)),
      ];

      console.log(nodes);

      // Record minimum & maximum number of links per node
      let minDegree = result.length === 0 ? 0 : Infinity;

      let maxDegree = 0;

      nodes.forEach(n => {
        if (n.degree > maxDegree)
          maxDegree = n.degree; 

        if (n.degree < minDegree)
          minDegree = n.degree;
      });

      // Links between folders & subfolderss
      const subfolderLinks = includeFolders ? folders.reduce<GraphLink[]>((all, folder) => {
        if (folder.parent) {
          const parent = store.getFolder(folder.parent);
          if (parent && 'id' in parent) {
            return [...all, { source: parent.id, target: folder.id, value: 1 }]
          } else {
            return all;
          }
        } else {
          return all;
        }
      }, []) : [];

      // Links between images and subfolders
      const imageFolderLinks = includeFolders ? images.reduce<GraphLink[]>((all, image) => {
        const parentFolder = store.getFolder(image.folder);
        if ('id' in parentFolder) {
          return [...all, { source: parentFolder.id, target: image.id, value: 1 }]
        } else {
          return all;
        }
      }, []) : [];

      // Parent-relationship links between entity classes
      const modelHierarchyLinks = datamodel.entityTypes.reduce<GraphLink[]>((all, type) => {
        if (type.parentId) {
          // Being defensive... make sure the parent ID actually exists
          const parent = datamodel.getEntityType(type.parentId);
          if (parent) {
            // Create link from parent to this entity
            return [...all, { source: parent.id, target: type.id, value: 1 }];
          } else {
            return all;
          }
        } else {
          return all;
        }
      }, []);

      // Links between annotations and entity types
      const annotationLinks =
        result.reduce<GraphLink[]>((all, { annotations, image }) => {
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

      const links = [
        ...subfolderLinks, 
        ...imageFolderLinks, 
        ...modelHierarchyLinks, 
        ...annotationLinks
      ];

      // Flatten links
      const flattened = links.reduce<GraphLink[]>((agg, link) => {
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
        if (link.value > maxLinkWeight)
          maxLinkWeight = link.value;

        if (link.value < minLinkWeight)
          minLinkWeight = link.value;
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

      setGraph({ 
        getLinkedNodes,
        getNeighbourhood,
        // force-graph seems to mutate in place sometimes - clone data!
        nodes: nodes.map(n => ({...n})), 
        links: flattened.map(l => ({...l})),
        minDegree, 
        maxDegree,
        minLinkWeight,
        maxLinkWeight
      });
    });
  }, [includeFolders]);

  return graph;

}