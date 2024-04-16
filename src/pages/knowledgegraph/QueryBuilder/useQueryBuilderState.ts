import { useState } from 'react';
import { BuildStep, BuildStepOption } from './BuildStep';
import { useStore } from '@/store';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { W3CAnnotationBody } from '@annotorious/react';

const STEP_1: BuildStep= {
  step: '1',
  options: [
    { value: 'all_nodes', label: 'All nodes' },
    { value: 'all_images', label: 'All images' },
    { value: 'all_folders', label: 'All folders' },
    { value: 'all_types', label: 'All entity classes' }
  ]
};

export const useQueryBuilderState = () => {

  const store = useStore();

  const datamodel = store.getDataModel();

  const [steps , setSteps] = useState<BuildStep[]>([STEP_1]);

  const enumerateMetadataOptions = (schemas: MetadataSchema[]): BuildStepOption[] =>
    schemas.reduce<PropertyDefinition[]>((flattend, schema) => {
      // Don't include properties with same name and type twice!
      const toAdd = (schema.properties || [])
        .filter(({ name, type }) => !flattend.find(d => d.name === name && d.type === type))

      return [...flattend, ...toAdd];
    }, []).slice().sort((a, b) => a.name.localeCompare(b.name))
    .map(definition => ({
      value: definition.name,
      label: definition.name,
      data: definition
    }));

  const listFolderOptions = (): BuildStepOption[] => 
    enumerateMetadataOptions(datamodel.folderSchemas);

  const listImageOptions = (): BuildStepOption[] => 
    enumerateMetadataOptions(datamodel.imageSchemas);

  const enumerateMetadataValues = (definition: PropertyDefinition, bodies: W3CAnnotationBody[]) =>
    bodies.reduce<BuildStepOption[]>((all, body) => {
      if ('properties' in body) {
        const value = body.properties[definition.name];

        if (value) {
          const exists = all.find(o => o.value === value);
          return exists ? all : [...all, { value: value, label: value }];
        } else {
          return all;
        }
      } else {
        return all;
      }
    }, []);

  const listFolderValues = (definition: PropertyDefinition) =>
    Promise.all(store.folders.map(folder => store.getFolderMetadata(folder.id)))
      .then(bodies => enumerateMetadataValues(definition, bodies.filter(Boolean)));

  const listImageValues = (definition: PropertyDefinition) =>
    Promise.all(store.images.map(image => store.getImageMetadata(image.id)))
      .then(bodies => enumerateMetadataValues(definition, bodies.filter(Boolean)));

  const setStep1 = (value: string) => setSteps(steps => ([
    // Make sure the selected option actually exists!
    {...STEP_1, selected: STEP_1.options.find(o => o.value === value)?.value },
    value === 'all_images' ? { step: '2.2', options: listImageOptions() } :
    value === 'all_folders' ? { step: '2.3', options: listFolderOptions() } :
    undefined 
  ].filter(Boolean)));

  const setStep2 = (step: string, value: string) => {
    const [step1, step2] = steps;

    const selectedOption = step2.options.find(o => o.value === value);
    
    if (selectedOption) {
      const definition: PropertyDefinition = selectedOption.data;

      const promise = 
        step === '2.2' ? listImageValues(definition) : 
        step === '2.3' ? listFolderValues(definition) :
        Promise.resolve([] as BuildStepOption[]);

      promise.then(options => {
        setSteps([step1, step2, { step: '3', options } as BuildStep]);
      });
    }
  }
    
  const select = (step: string, value: string) => {
    if (step === '1')
      setStep1(value);
    else if (step.startsWith('2.'))
      setStep2(step, value);
  }

  return { steps, select };

}