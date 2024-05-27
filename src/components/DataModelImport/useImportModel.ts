import AJV from 'ajv';
import { EntityType } from '@/model';
import { useDataModel, useStore } from '@/store';

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
      properties: { type: 'object' }
    },
    required: ['id']
  }
}

const validate = ajv.compile(schema);

export const validateEntityTypes = (types: EntityType[]) => validate(types);

export const useImportEntityTypes = () => {

  const model = useDataModel();

  const importEntityTypes = (types: EntityType[], replace: boolean, mergePolicyKeep?: boolean) =>
    types.reduce<Promise<void>>((promise, t) => promise.then(() => {
      return model.addEntityType(t)
    }), Promise.resolve());

  return importEntityTypes;
  
}