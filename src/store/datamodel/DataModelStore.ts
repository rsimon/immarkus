import type { EntityType,MetadataSchema, PropertyDefinition } from '@/model';
import { DataModel } from './DataModel';
import { readJSONFile, writeJSONFile } from '../utils';
import { EntityTypeTree, createEntityTypeTree } from './EntityTypeTree';
import { removeMissingParentIds, repairDataModel } from '../integrity';

export interface DataModelStore extends DataModel, EntityTypeTree {

  // Entity types
  addEntityType(type: EntityType): Promise<void>;

  clearEntityTypes(): Promise<void>;

  getEntityType(id: string, inheritProps?: boolean): EntityType | undefined;

  removeEntityType(typeOrId: EntityType | string): Promise<void>;

  setEntityTypes(types: EntityType[]): Promise<void>;
  
  updateEntityType(type: EntityType): Promise<void>;

  // Relationship Types
  addRelationshipType(type: string): Promise<void>;

  removeRelationShipType(type: string): Promise<void>;

  // Folder metadata schemas
  addFolderSchema(schema: MetadataSchema): Promise<void>;

  clearFolderSchemas(): Promise<void>;

  getFolderSchema(name: string): MetadataSchema | undefined;

  removeFolderSchema(schemaOrName: MetadataSchema | string): Promise<void>;

  setFolderSchemas(schemas: MetadataSchema[]): Promise<void>;

  updateFolderSchema(schema: MetadataSchema): Promise<void>;

  // Image metadata schemas
  addImageSchema(schema: MetadataSchema): Promise<void>;

  clearImageSchemas(): Promise<void>;

  getImageSchema(name: string): MetadataSchema | undefined;

  removeImageSchema(schemaOrName: MetadataSchema | string): Promise<void>;

  setImageSchemas(schemas: MetadataSchema[]): Promise<void>;

  updateImageSchema(schema: MetadataSchema): Promise<void>;

}

const loadFromFile = (file: File) =>
  readJSONFile<DataModel>(file)
    .then(data => {
      const { entityTypes, folderSchemas, imageSchemas } = data;
      return {
        entityTypes: entityTypes || [],
        folderSchemas: folderSchemas || [],
        imageSchemas: imageSchemas || []
      }
    })
    .catch(() => {
      return { 
        entityTypes: [],
        folderSchemas: [],
        imageSchemas: []
      }
    });

export const loadDataModel = (
  handle: FileSystemDirectoryHandle
): Promise<DataModelStore> => new Promise(async resolve => {

  const fileHandle = await handle.getFileHandle('_immarkus.model.json', { create: true });

  const file = await fileHandle.getFile();

  let { entityTypes, imageSchemas, folderSchemas } = await loadFromFile(file);

  entityTypes = repairDataModel(entityTypes);

  // TODO
  let relationshipTypes = [];

  const tree = createEntityTypeTree(entityTypes);

  const rebuildEntityTypeTreeAndSave = () => {
    tree.rebuild(entityTypes);
    return writeJSONFile(fileHandle, { entityTypes, folderSchemas, imageSchemas });
  }

  const save = () =>
    writeJSONFile(fileHandle, { entityTypes, folderSchemas, imageSchemas });

  /** API **/

  const addEntityType = (type: EntityType) => {
    if (!entityTypes.find(e => e.id === type.id)) {
      entityTypes = [...entityTypes, type];
      return rebuildEntityTypeTreeAndSave();
    } else {
      return Promise.reject(`Entity with ID ${type.id} already exists`);
    }
  }

  const addFolderSchema = (schema: MetadataSchema) => {
    if (!folderSchemas.find(s => s.name === schema.name)) {
      folderSchemas = [...folderSchemas, schema];
      return save();
    } else {
      return Promise.reject(`Folder schema "${schema.name}" already exists`);
    }
  }

  const addImageSchema = (schema: MetadataSchema) => {
    if (!imageSchemas.find(s => s.name === schema.name)) {
      imageSchemas = [...imageSchemas, schema];
      return save();
    } else {
      return Promise.reject(`Image schema "${schema.name}" already exists`);
    }
  }

  const addRelationshipType = (type: string) => {
    // TODO
    if (!relationshipTypes.includes(type))
      relationshipTypes = [...relationshipTypes, type];

    return Promise.resolve();
  }

  const clearEntityTypes = () => {
    entityTypes = [];
    return rebuildEntityTypeTreeAndSave();
  }

  const clearFolderSchemas = () => {
    folderSchemas = [];
    return save();
  }

  const clearImageSchemas = () => {
    imageSchemas = [];
    return save();
  }

  const getEntityType = (id: string, inheritProps = false) => {
    const type = entityTypes.find(e => e.id === id);

    if (!inheritProps)
      return type;

    const buildPropsRecursive = (type: EntityType, properties?: PropertyDefinition[]) => {
      const parent = entityTypes.find(e => e.id === type.parentId);
      if (parent) {
        const parentProperties = (parent.properties || []).map(p => ({ ...p, inheritedFrom: parent.id }));
        return buildPropsRecursive(parent, [...parentProperties, ...(properties || [])]);
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

  const getFolderSchema = (name: string) =>
    folderSchemas.find(s => s.name === name);

  const getImageSchema = (name: string) =>
    imageSchemas.find(s => s.name === name);

  const removeEntityType = (typeOrId: EntityType | string) => {
    const id = typeof typeOrId === 'string' ? typeOrId : typeOrId.id;
    const next = entityTypes.filter(e => e.id !== id);

    // Repair the graph, in case the removed entity had children
    entityTypes = removeMissingParentIds(next);

    return rebuildEntityTypeTreeAndSave();
  }

  const removeFolderSchema = (schemaOrName: MetadataSchema | string) => {
    const name = typeof schemaOrName === 'string' ? schemaOrName : schemaOrName.name;
    folderSchemas = folderSchemas.filter(s => s.name !== name);
    return save();
  }

  const removeImageSchema = (schemaOrName: MetadataSchema | string) => {
    const name = typeof schemaOrName === 'string' ? schemaOrName : schemaOrName.name;
    imageSchemas = imageSchemas.filter(s => s.name !== name);
    return save();
  }

  const removeRelationShipType = (type: string) => {
    relationshipTypes = relationshipTypes.filter(t => t !== type);
    return Promise.resolve();
  }

  const setEntityTypes = (types: EntityType[]) => {
    entityTypes = [...types];
    return rebuildEntityTypeTreeAndSave();
  }

  const setFolderSchemas = (schemas: MetadataSchema[]) => {
    folderSchemas = [...schemas];
    return save();
  }

  const setImageSchemas = (schemas: MetadataSchema[]) => {
    imageSchemas = [...schemas];
    return save();
  }

  const updateEntityType = (type: EntityType) => {
    if (entityTypes.find(e => e.id === type.id)) {
      entityTypes = entityTypes.map(e => e.id === type.id ? type : e);
      return rebuildEntityTypeTreeAndSave();
    } else {
      return Promise.reject(`Attempt to update entity ${type.id} but does not exist in store`);
    }
  }

  const updateFolderSchema = (schema: MetadataSchema) => {
    if (folderSchemas.find(s => s.name === schema.name)) {
      folderSchemas = folderSchemas.map(s => s.name === schema.name ? schema : s);
      return save();
    } else {
      return Promise.reject(`Attempt to update folder scheam ${schema.name} but does not exist in store`);
    }
  }

  const updateImageSchema = (schema: MetadataSchema) => {
    if (imageSchemas.find(s => s.name === schema.name)) {
      imageSchemas = imageSchemas.map(s => s.name === schema.name ? schema : s);
      return save();
    } else {
      return Promise.reject(`Attempt to update image scheam ${schema.name} but does not exist in store`);
    }
  }

  resolve({
    ...tree, 
    get entityTypes() { return entityTypes },
    get relationshipTypes() { return relationshipTypes },
    get folderSchemas() { return folderSchemas },
    get imageSchemas() { return imageSchemas },
    addEntityType,
    addFolderSchema,
    addImageSchema,
    addRelationshipType,
    clearEntityTypes,
    clearFolderSchemas,
    clearImageSchemas,
    getEntityType,
    getFolderSchema,
    getImageSchema,
    removeEntityType,
    removeFolderSchema,
    removeImageSchema,
    removeRelationShipType,
    setEntityTypes,
    setFolderSchemas,
    setImageSchemas,
    updateEntityType,
    updateFolderSchema,
    updateImageSchema
  });

});