import { Entity } from '@/model';
import { createSafeKeys } from './PropertyKeys';
import { W3CAnnotationBody } from '@annotorious/react';
import { NumberPropertyField, TextPropertyField, URIPropertyField } from '@/components/PropertyFields';

interface EntitySchemaFieldsProps {

  showErrors?: boolean;

  body: W3CAnnotationBody,

  entity: Entity;

  safeKeys: ReturnType<typeof createSafeKeys>;

  values: {[key: string]: string};

  onChange(key: string, value: any): void;

}

export const EntitySchemaFields = (props: EntitySchemaFieldsProps) => {

  const { body, entity, safeKeys } = props;

  const fields = (entity.schema || [])
    .map(property => ({ 
      property, 
      key: safeKeys.getKey(body, property.name)
    }));
  
  return (
    <>
      {fields.map(({ property, key }) => (
        <div className="mt-2" key={key}>
          {property.type === 'enum' ? (
            <div />
          ) : property.type === 'number' ? (
            <NumberPropertyField
              id={key}
              property={property} 
              value={props.values[key]}
              validate={props.showErrors}
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'text' ? (
            <TextPropertyField 
              id={key}
              property={property} 
              value={props.values[key]}
              validate={props.showErrors} 
              onChange={value => props.onChange(key, value)} />
          ) : property.type === 'uri' ? (
            <URIPropertyField 
              id={key}
              property={property} 
              value={props.values[key]}
              validate={props.showErrors} 
              onChange={value => props.onChange(key, value)} />
          ) : null }
        </div>
      ))}
    </>
  )

}