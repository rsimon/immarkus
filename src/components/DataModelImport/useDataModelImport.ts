import AJV, { ValidateFunction } from 'ajv';
import { EntityType, MetadataSchema, RelationshipType } from '@/model';
import { useDataModel } from '@/store';

const ajv = new AJV();

const ENTITY_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      color: { type: 'string' },
      label: { type: 'string' },
      parentId: { type: 'string' },
      description: { type: 'string' },
      properties: { type: 'array' }
    },
    required: ['id']
  }
}

const _validateEntityTypes = ajv.compile(ENTITY_SCHEMA);

const METADATA_SCHEMA = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
      properties: { type: 'array' }
    },
    required: ['name']
  }
}

const _validateMetadata = ajv.compile(METADATA_SCHEMA);

// Shorthand
const validate = (data: any, validator: ValidateFunction<unknown>) => {
  const isValid = validator(data);

  if (!isValid)
    console.error(validator.errors);

  return isValid;
}

export const validateEntityTypes = (types: EntityType[]) => 
  validate(types, _validateEntityTypes);

export const validateMetadata = (schemas: MetadataSchema[]) =>
  validate(schemas, _validateMetadata);

export const useDataModelImport = () => {

  const model = useDataModel();

  const importEntityTypes = (types: EntityType[], replace: boolean, mergePolicyKeep?: boolean) => {
    if (replace) {
      // Simple import - replace existing model
      return model.setEntityTypes(types);
    } else {
      // Merge current model with imported entity types
      const toAdd = types.filter(t => !model.getEntityType(t.id));

      const next = mergePolicyKeep 
        // In case of duplicates, keep current
        ? model.entityTypes
        // In case of duplicates, keep imported
        : model.entityTypes.map(t => types.find(i => i.id === t.id) || t);

      const merged = [...next, ...toAdd];

      return model.setEntityTypes(merged);
    }
  }

  const importRelationshipTypes = (types: RelationshipType[], replace: boolean, mergePolicyKeep?: boolean) => {
    if (replace) {
      return model.setRelationshipTypes(types);
    } else {
      const toAdd = types.filter(t => !model.getRelationshipType(t.name));

      const next = mergePolicyKeep
        // Keep existing
        ? model.relationshipTypes
        // Replace existing
        : model.relationshipTypes.map(existing => types.find(t => t.name === existing.name) || existing)
      
      const merged = [...next, ...toAdd];
      return model.setRelationshipTypes(merged);
    }
  }

  const mergeSchemas = (current: MetadataSchema[], toMerge: MetadataSchema[], mergePolicyKeep?: boolean) => {
    const toAdd = toMerge.filter(schema => !current.some(s => s.name === schema.name));

    const next = mergePolicyKeep 
      ? current 
      : current.map(schema => toMerge.find(i => i.name === schema.name) || schema);

    return [...next, ...toAdd];
  }

  const importFolderSchemas = (schemas: MetadataSchema[], replace: boolean, mergePolicyKeep?: boolean) => {
    return replace
      ? model.setFolderSchemas(schemas)
      : model.setFolderSchemas(mergeSchemas(model.folderSchemas, schemas, mergePolicyKeep));
  }

  const importImageSchemas = (schemas: MetadataSchema[], replace: boolean, mergePolicyKeep?: boolean) => {
    return replace
      ? model.setImageSchemas(schemas)
      : model.setImageSchemas(mergeSchemas(model.imageSchemas, schemas, mergePolicyKeep));
  }

  return { 
    importEntityTypes,
    importRelationshipTypes,
    importFolderSchemas,
    importImageSchemas
  };
  
}