import { useEffect, useState } from 'react';
import { ModelPreset, useRuntimeConfig } from '@/RuntimeConfig';
import { MetadataSchema } from '@/model';

export const useSchemaPresets = (
  type: 'ENTITY_TYPES' | 'FOLDER_SCHEMAS' | 'IMAGE_SCHEMAS' | 'RELATIONSHIP_TYPES'
) => {

  const config = useRuntimeConfig();

  const [schemas, setSchemas] = useState<MetadataSchema[]>([]);

  useEffect(() => {
    const presets = (config.model_presets || []).reduce<ModelPreset[]>((all, next) => {
      if (next.type === type) {
        return [...all, next];
      } else {
        return all;
      }
    }, []);

    const promise = presets.reduce<Promise<MetadataSchema[]>>((promise, preset) => promise.then(all => {
      return fetch(preset.url)
        .then(res => res.json())
        .catch(() => {
          return all;
        })
        .then(schemas => {
          return [...all, ...schemas];
        })
    }), Promise.resolve<MetadataSchema[]>([]));
    
    promise.then(setSchemas);
  }, [type]);

  return schemas;

}