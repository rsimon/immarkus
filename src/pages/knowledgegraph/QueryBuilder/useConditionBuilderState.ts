import { useEffect, useState } from 'react';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { useStore } from '@/store';
import { GraphNode } from '../Types';
import { QueryConditionOption } from './QueryConditionOption';
import { W3CAnnotationBody } from '@annotorious/react';

const ALLOWED_PROPERTY_TYPES = new Set([
  'enum',
  'external_authority',
  'number',
  'text',
  'uri'
]);

interface UseConditionBuilderStateProps {

  typeFilter?: GraphNode['type'];

  selectedSubject?: string;

}

export const useConditionBuilderState = (props: UseConditionBuilderStateProps) => {

  const store = useStore();

  const datamodel = store.getDataModel();

  const [subjectOptions, setSubjectOptions] = useState<QueryConditionOption[]>([]);

  const [objectOptions, setObjectOptions] = useState<QueryConditionOption[]>([]);

  const getMetadataSubjectOptions = (schemas: MetadataSchema[]): QueryConditionOption[] =>
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
    }))
    .filter(o => ALLOWED_PROPERTY_TYPES.has(o.data.type));

  const getSubjectOptions = (type?: GraphNode['type']): QueryConditionOption[] => {
    if (type === 'IMAGE')
      return getMetadataSubjectOptions(datamodel.imageSchemas);
    else if (type === 'FOLDER')
      return getMetadataSubjectOptions(datamodel.folderSchemas);
    else 
      // TODO
      return [];
  }
  
  const getMetadataObjectOptions = (propertyName: string, bodies: W3CAnnotationBody[]) =>
    bodies.reduce<QueryConditionOption[]>((all, body) => {
      if ('properties' in body) {
        const value = body.properties[propertyName];
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

  const getObjectOptions = (type: GraphNode['type'] | undefined, subject: string) => {
    if (type === 'IMAGE') {
      Promise.all(
        store.images.map(image => store.getImageMetadata(image.id))
      ).then(bodies => 
        setObjectOptions(getMetadataObjectOptions(subject, bodies.filter(Boolean)))
      );
    } else if (type === 'FOLDER') {

    } else {
      // TODO
      return [];
    }
  }

  useEffect(() => {
    setSubjectOptions(getSubjectOptions(props.typeFilter));
  }, [props.typeFilter]);

  useEffect(() => {
    if (!props.selectedSubject) return;
      getObjectOptions(props.typeFilter, props.selectedSubject);
  }, [props.typeFilter, props.selectedSubject]);

  return { subjectOptions, objectOptions };

}