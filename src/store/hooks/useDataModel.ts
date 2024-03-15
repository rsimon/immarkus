import { useContext } from 'react';
import { StoreContext } from '../StoreProvider';
import { EntityType, MetadataSchema } from '@/model';

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

  const removeEntityType = (typeOrId: EntityType | string) =>
    setAsync(model.removeEntityType(typeOrId));

  const removeFolderSchema = (schemaOrName: MetadataSchema | string) =>
    setAsync(model.removeFolderSchema(schemaOrName));

  const removeImageSchema = (schemaOrName: MetadataSchema | string) =>
    setAsync(model.removeImageSchema(schemaOrName));

  const updateEntityType = (type: EntityType) => 
    setAsync(model.updateEntityType(type));

  const updateFolderSchema = (schema: MetadataSchema) =>
    setAsync(model.updateFolderSchema(schema));

  const updateImageSchema = (schema: MetadataSchema) =>
    setAsync(model.updateImageSchema(schema));

  return { 
    ...model,
    addEntityType,
    addFolderSchema,
    addImageSchema,
    removeEntityType,
    removeFolderSchema,
    removeImageSchema,
    updateEntityType,
    updateFolderSchema,
    updateImageSchema
  };
}