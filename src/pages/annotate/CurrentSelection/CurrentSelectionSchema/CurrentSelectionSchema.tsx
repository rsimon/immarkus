import { useVocabulary } from '@/store';
import { ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { useFormik } from 'formik';
import { EntitySchemaFields } from './EntitySchemaFields';

interface CurrentSelectionSchemaProps {

  annotation: ImageAnnotation;

}

const toSafeKey = (str: string) =>
  str.replaceAll(/[.,\/#!$%^&*;:{}=\-_`~()\s]/g, '_').toLowerCase();

export const CurrentSelectionSchema = (props: CurrentSelectionSchemaProps) => {

  const tags: W3CAnnotationBody[] = props.annotation.bodies.filter(b => b.purpose === 'classifying');

  const { getEntity } = useVocabulary();

  const schemaBodies = tags
    .map(body => ({ body, entity: getEntity(body.source) }))
    .filter(({ entity }) => entity.schema?.length > 0);

  // Converts schema names to keys we can safely use with formik, and
  // keeps a lookup table (or, rather, list): key -> name
  const safeKeys: [string, string][] = schemaBodies.reduce((safeKeys, { entity }) => (
    [...safeKeys, ...entity.schema.map(property => ([toSafeKey(property.name), property.name]))]
  ), []);

  const initialValues = schemaBodies.reduce((initialValues, { entity, body }) => ({
    ...initialValues,
    ...Object.fromEntries(entity.schema!.map(property => ([
      safeKeys.find(([_, name]) => name === property.name)[0], 
      'schema' in body ? body.schema[property.name] || '' : '' 
    ])))
  }), {});

  const formik = useFormik({
    initialValues,

    onSubmit: values => {
      // Resolve value keys to property names
      const resolved = Object.entries(values).map(([key, value]) => ([
        safeKeys.find(([safeKey, ]) => safeKey === key)[1],
        value
      ]));

      // TODO need to split this up across bodies and save the 
      // bodies in the annotation
      console.log('submitting', resolved);
    }
  });

  return schemaBodies.length > 0 ? schemaBodies.length === 1 ? (
    <form className="mt-2 px-1" onSubmit={formik.handleSubmit}>
      <EntitySchemaFields 
        entity={schemaBodies[0].entity}
        safeKeys={safeKeys}
        formik={formik} />

      <button type="submit">Save</button>
    </form>
  ) : (
    <form className="mt-2 px-1" onSubmit={formik.handleSubmit}>
      {schemaBodies.map(({ body, entity}) => (
        <div>
          <h3>{entity.label}</h3>

          <EntitySchemaFields
            entity={entity}
            safeKeys={safeKeys}
            formik={formik} />
        </div>
      ))}

      <button type="submit">Save</button>
    </form>
  ) : null;

}