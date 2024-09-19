import { W3CAnnotation } from '@annotorious/react';
import { EntityType, Folder, Image } from '@/model';
import { GraphLinkPrimitive, GraphNode } from '../Types';
import { DataModel, DataModelStore, Store } from '@/store';

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

export const getFolderStructurePrimitives = (folders: Folder[], store: Store) =>
  folders.reduce<GraphLinkPrimitive[]>((all, folder) => {
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

export const getImageFolderPrimitives = (images: Image[], store: Store) =>
  images.reduce<GraphLinkPrimitive[]>((all, image) => {
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

export const getEntityAnnotationPrimitives = (annotatedImages: { image: Image; annotations: W3CAnnotation[]; }[]) => {

}