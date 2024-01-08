import type { EntityType, PropertyDefinition } from '@/model';
import { DataModel } from './DataModel';
import { readJSONFile, writeJSONFile } from '../utils';
import { EntityTypeTree, createEntityTypeTree } from './EntityTypeTree';

export interface DataModelStore extends DataModel, EntityTypeTree {

  getEntityType(id: string, inheritProps?: boolean): EntityType | undefined;

  addEntityType(type: EntityType): Promise<void>;

  removeEntityType(typeOrId: EntityType | string): Promise<void>;
  
  updateEntityType(type: EntityType): Promise<void>;

}

export const loadDataModel = (
  handle: FileSystemDirectoryHandle
): Promise<DataModelStore> => new Promise(async resolve => {

  const fileHandle = await handle.getFileHandle('_immarkus.model.json', { create: true });

  const file = await fileHandle.getFile();

  let { entityTypes } = (await readJSONFile<DataModel>(file) || {

    entityTypes: []

  });

  const tree = createEntityTypeTree(entityTypes);

  const rebuildAndSave = () => {
    tree.rebuild(entityTypes);
    return writeJSONFile(fileHandle, { entityTypes });
  }

  /** API **/

  const addEntityType = (type: EntityType) => {
    if (!entityTypes.find(e => e.id === type.id)) {
      entityTypes = [...entityTypes, type];
      return rebuildAndSave();
    } else {
      return Promise.reject(`Entity with ID ${type.id} already exists`);
    }
  }

  const getDataModel = () => ({ entityTypes });

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

  const removeEntityType = (typeOrId: EntityType | string) => {
    const id = typeof typeOrId === 'string' ? typeOrId : typeOrId.id;
    entityTypes = entityTypes.filter(e => e.id !== id);
    return rebuildAndSave();
  }

  const updateEntityType = (type: EntityType) => {
    if (entityTypes.find(e => e.id === type.id)) {
      entityTypes = entityTypes.map(e => e.id === type.id ? type : e);
      return rebuildAndSave();
    } else {
      return Promise.reject(`Attempt to update entity ${type.id} but does not exist in store`);
    }
  }

  resolve({
    ...tree, 
    get entityTypes() { return entityTypes },
    addEntityType,
    getEntityType,
    removeEntityType,
    updateEntityType
  });

});