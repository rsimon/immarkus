import { useFormik } from 'formik';
import { Entity } from '@/model';
import { Label } from '@/ui/Label';
import { createSafeKeys } from './PropertyKeys';
import { W3CAnnotationBody } from '@annotorious/react';
import { EnumField, NumberField, StringField, URIField } from './SchemaFields';

interface EntitySchemaFieldsProps {

  body: W3CAnnotationBody,

  entity: Entity;

  safeKeys: ReturnType<typeof createSafeKeys>;

  formik: ReturnType<typeof useFormik>;

}

export const EntitySchemaFields = (props: EntitySchemaFieldsProps) => {

  const { body, entity, safeKeys } = props;
  
  return (
    <>
      {(entity.schema || []).map(property => (
        <div className="mt-2" key={safeKeys.getKey(body, property.name)}>
          {property.type === 'enum' ? (
            <EnumField 
              {...props}
              {...property} />
          ) : property.type === 'number' ? (
            <NumberField
              {...props}
              {...property} />
          ) : property.type === 'string' ? (
            <StringField 
              {...props}
              {...property} />
          ) : property.type === 'uri' ? (
            <URIField 
              {...props}
              {...property} />
          ) : null }
        </div>
      ))}
    </>
  )

}