import { useContext } from 'react';
import { StoreContext } from '../StoreProvider';
import { EntityType, MetadataSchema, RelationshipType } from '@/model';

export const useDataModel = () => {

  const { store, model, setModel } = useContext(StoreContext);

  const setAsync = (p: Promise<void>) =>
    p.then(() => setModel({...store.getDataModel()}));

  /** 
   * Override methods that modify the model and update the model
   * instance in the state, so that it becomes reactive.
   */
  const addEntityType = (type: EntityType) =>
    setAsync(model.addEntityType(type));

  const addFolderSchema = (schema: MetadataSchema) =>
    setAsync(model.addFolderSchema(schema));

  const addImageSchema = (schema: MetadataSchema) =>
    setAsync(model.addImageSchema(schema));

  const clearEntityTypes = () =>
    setAsync(model.clearEntityTypes());

  const clearFolderSchemas = () =>
    setAsync(model.clearFolderSchemas());

  const clearImageSchemas = () =>
    setAsync(model.clearImageSchemas());

  const removeEntityType = (typeOrId: EntityType | string) =>
    setAsync(model.removeEntityType(typeOrId));

  const removeFolderSchema = (schemaOrName: MetadataSchema | string) =>
    setAsync(model.removeFolderSchema(schemaOrName));

  const removeImageSchema = (schemaOrName: MetadataSchema | string) =>
    setAsync(model.removeImageSchema(schemaOrName));

  const removeRelationshipType = (name: string) => 
    setAsync(model.removeRelationshipType(name));

  const setRelationshipTypes = (types: RelationshipType[]) =>
    setAsync(model.setRelationshipTypes(types));

  const setEntityTypes = (types: EntityType[]) =>
    setAsync(model.setEntityTypes(types));

  const setFolderSchemas = (schemas: MetadataSchema[]) =>
    setAsync(model.setFolderSchemas(schemas));

  const setImageSchemas = (schemas: MetadataSchema[]) =>
    setAsync(model.setImageSchemas(schemas));

  const updateEntityType = (type: EntityType) => 
    setAsync(model.updateEntityType(type));

  const updateFolderSchema = (schema: MetadataSchema) =>
    setAsync(model.updateFolderSchema(schema));

  const updateImageSchema = (schema: MetadataSchema) =>
    setAsync(model.updateImageSchema(schema));

  const upsertRelationshipType = (type: RelationshipType) =>
    setAsync(model.upsertRelationshipType(type));

  return { 
    ...model,
    addEntityType,
    addFolderSchema,
    addImageSchema,
    clearEntityTypes,
    clearFolderSchemas,
    clearImageSchemas,
    removeEntityType,
    removeFolderSchema,
    removeImageSchema,
    removeRelationshipType,
    setEntityTypes,
    setFolderSchemas,
    setImageSchemas,
    setRelationshipTypes,
    updateEntityType,
    updateFolderSchema,
    updateImageSchema,
    upsertRelationshipType
  };
}