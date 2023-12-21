import type { EntityType, Tag } from '@/model';
import { DataModel } from './DataModel';
import { readJSONFile, writeJSONFile } from './utils';

export interface DataModelStore {

  getDataModel(): DataModel;

  addEntityType(type: EntityType): Promise<void>;

  updateEntityType(type: EntityType): Promise<void>;

  removeEntityType(typeOrId: EntityType | string): Promise<void>;

  addTag(tag: Tag): Promise<void>;

  removeTag(tag: Tag): Promise<void>;

}

export const loadDataModel = (handle: FileSystemDirectoryHandle): Promise<DataModelStore> => 

  new Promise(async resolve => {

    const fileHandle = await handle.getFileHandle('_immarkus.model.json', { create: true });

    const file = await fileHandle.getFile();

    let { entityTypes, tags } = (await readJSONFile<DataModel>(file) || {

      entityTypes: [],

      tags: []

    });

    const save = () => writeJSONFile(fileHandle, { entityTypes, tags });

    const getDataModel = () => ({ entityTypes, tags });

    const addEntityType = (type: EntityType) => {
      if (!entityTypes.find(e => e.id === type.id)) {
        entityTypes = [...entityTypes, type];
        return save();
      } else {
        return Promise.reject(`Entity with ID ${type.id} already exists`);
      }
    }

    const updateEntityType = (type: EntityType) => {
      if (entityTypes.find(e => e.id === type.id)) {
        entityTypes = entityTypes.map(e => e.id === type.id ? type : e);
        return save();
      } else {
        return Promise.reject(`Attempt to update entity ${type.id} but does not exist in store`);
      }
    }

    const removeEntityType = (typeOrId: EntityType | string) => {
      const id = typeof typeOrId === 'string' ? typeOrId : typeOrId.id;
      entityTypes = entityTypes.filter(e => e.id !== id);
      return save();
    }

    const addTag = (tag: Tag) => {
      if (!tags.includes(tag)) {
        tags = [...tags, tag];
        return save();
      } else { 
        return Promise.reject(`Tag ${tag} already exists`);
      }
    }

    const removeTag = (tag: Tag) => {
      tags = tags.filter(t => t !== tag);
      return save();
    }

    resolve({
      getDataModel,
      addEntityType,
      updateEntityType,
      removeEntityType,
      addTag,
      removeTag
    });

});