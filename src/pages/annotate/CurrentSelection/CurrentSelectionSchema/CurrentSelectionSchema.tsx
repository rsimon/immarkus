import { useVocabulary } from '@/store';
import { AnnotationBody, ImageAnnotation, W3CAnnotationBody, useAnnotationStore } from '@annotorious/react';
import { useFormik } from 'formik';
import { Button } from '@/ui/Button';
import { EntitySchemaFields } from './EntitySchemaFields';
import { createSafeKeys } from './PropertyKeys';

interface CurrentSelectionSchemaProps {

  annotation: ImageAnnotation;

}

export const CurrentSelectionSchema = (props: CurrentSelectionSchemaProps) => {

  const tags: W3CAnnotationBody[] = props.annotation.bodies.filter(b => b.purpose === 'classifying');

  const store = useAnnotationStore();

  const { getEntity } = useVocabulary();

  const schemaBodies = tags
    .map(body => ({ body, entity: getEntity(body.source) }))
    .filter(({ entity }) => entity.schema?.length > 0);

  const safeKeys = createSafeKeys(schemaBodies);

  const initialValues = schemaBodies.reduce((initialValues, { entity, body }) => ({
    ...initialValues,
    ...Object.fromEntries(entity.schema!.map(property => ([
      safeKeys.getKey(body, property.name), 
      'properties' in body ? body.properties[property.name] || '' : '' 
    ])))
  }), {});

  const formik = useFormik({
    initialValues,

    onSubmit: values => {
      const updatedBodies = schemaBodies.map(({ body, entity }) => {

        const properties = Object.entries(values).reduce((properties, [key, value]) => {
          const name = safeKeys.getName(key);

          // This will return undefined if this key is not in this body
          const expectedKey = safeKeys.getKey(body, name);

          if (expectedKey == key)
            return { ...properties, [name as string]: value };
          else
            return properties;
        }, {});

        return { annotation: props.annotation.id, ...body, properties };
      });

      store.bulkUpdateBodies(updatedBodies as AnnotationBody[]);
    }
  });

  return schemaBodies.length > 0 ? schemaBodies.length === 1 ? (
    <form className="mt-2 px-1" onSubmit={formik.handleSubmit}>
      <EntitySchemaFields 
        body={schemaBodies[0].body}
        entity={schemaBodies[0].entity}
        safeKeys={safeKeys}
        formik={formik} />

      <Button className="mt-3 h-8" type="submit">Save</Button>
    </form>
  ) : (
    <form className="mt-2 px-1" onSubmit={formik.handleSubmit}>
      {schemaBodies.map(({ body, entity }, idx) => (
        <div key={body.id} className="mb-4">
          <h3 className="text-xs font-semibold mt-3 text-muted-foreground">
            {entity.label}
          </h3>

          <EntitySchemaFields
            body={body}
            entity={entity}
            safeKeys={safeKeys}
            formik={formik} />
        </div>
      ))}

      <Button className="mt-0 h-8" type="submit">Save</Button>
    </form>
  ) : null;

}