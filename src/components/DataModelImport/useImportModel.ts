import AJV from 'ajv';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';

const ajv = new AJV();

const schema = {
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

const validate = ajv.compile(schema);

export const validateEntityTypes = (types: EntityType[]) => {
  const isValid = validate(types);
  
  if (!isValid)
    console.error(validate.errors);

  return isValid;
}

export const useImportEntityTypes = () => {

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

  return importEntityTypes;
  
}