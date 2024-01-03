import type { EntityType, PropertyDefinition, Tag } from '@/model';
import { DataModel } from './DataModel';
import { createEntityTypeIndex } from './DataModelIndex';
import { readJSONFile, writeJSONFile } from './utils';

export interface DataModelStore {

  getDataModel(): DataModel;

  getEntityType(id: string, inheritProps?: boolean): EntityType | undefined;

  addEntityType(type: EntityType): Promise<void>;

  addTag(tag: Tag): Promise<void>;

  removeEntityType(typeOrId: EntityType | string): Promise<void>;

  removeTag(tag: Tag): Promise<void>;

  searchEntityTypes(query: string): EntityType[];
  
  updateEntityType(type: EntityType): Promise<void>;

}

export const loadDataModel = (
  handle: FileSystemDirectoryHandle
): Promise<DataModelStore> => new Promise(async resolve => {

  const fileHandle = await handle.getFileHandle('_immarkus.model.json', { create: true });

  const file = await fileHandle.getFile();

  let { entityTypes, tags } = (await readJSONFile<DataModel>(file) || {

    entityTypes: [],

    tags: []

  });

  let index = createEntityTypeIndex(entityTypes);

  const save = () => {
    index = createEntityTypeIndex(entityTypes);
    return writeJSONFile(fileHandle, { entityTypes, tags });
  }

  /** API **/

  const addEntityType = (type: EntityType) => {
    if (!entityTypes.find(e => e.id === type.id)) {
      entityTypes = [...entityTypes, type];
      return save();
    } else {
      return Promise.reject(`Entity with ID ${type.id} already exists`);
    }
  }

  const addTag = (tag: Tag) => {
    if (!tags.includes(tag)) {
      tags = [...tags, tag];
      return save();
    } else { 
      return Promise.reject(`Tag ${tag} already exists`);
    }
  }

  const getDataModel = () => ({ entityTypes, tags });

  const getEntityType = (id: string, inheritProps = false) => {
    const type = entityTypes.find(e => e.id === id);

    if (!inheritProps)
      return type;

    const buildPropsRecursive = (type: EntityType, properties?: PropertyDefinition[]) => {
      const parent = entityTypes.find(e => e.id === type.parentId);
      if (parent) {
        if (parent.properties) {
          return [
            ...parent.properties.map(p => ({ ...p, inheritedFrom: parent.id })), 
            ...(properties || [])
          ];
        } else {
          return properties;
        }
      } else {
        return properties;
      }
    }

    if (type) {
      // Inherit properties from parent hierarchy (if any)
      const properties = type.parentId ? buildPropsRecursive(type, type.properties) : type.properties;

      return {
        ...type,
        properties
      }
    }
  }

  const removeTag = (tag: Tag) => {
    tags = tags.filter(t => t !== tag);
    return save();
  }

  const removeEntityType = (typeOrId: EntityType | string) => {
    const id = typeof typeOrId === 'string' ? typeOrId : typeOrId.id;
    entityTypes = entityTypes.filter(e => e.id !== id);
    return save();
  }

  const searchEntityTypes = (query: string) => index.searchEntityTypes(query);

  const updateEntityType = (type: EntityType) => {
    if (entityTypes.find(e => e.id === type.id)) {
      entityTypes = entityTypes.map(e => e.id === type.id ? type : e);
      return save();
    } else {
      return Promise.reject(`Attempt to update entity ${type.id} but does not exist in store`);
    }
  }

  resolve({
    addEntityType,
    addTag,
    getDataModel,
    getEntityType,
    removeEntityType,
    removeTag,
    searchEntityTypes,
    updateEntityType,
  });

});