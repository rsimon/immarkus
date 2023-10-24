import { useVocabulary } from '@/store';
import { 
  AnnotationBody, 
  ImageAnnotation, 
  W3CAnnotationBody, 
  createBody, 
  useAnnotationStore 
} from '@annotorious/react';
import { useFormik } from 'formik';
import { Button } from '@/ui/Button';
import { EntitySchemaFields } from './EntitySchemaFields';
import { createSafeKeys } from './PropertyKeys';
import { CurrentSelectionNote } from './CurrentSelectionNote';

interface CurrentSelectionMetadataProps {

  annotation: ImageAnnotation;

}

export const CurrentSelectionMetadata = (props: CurrentSelectionMetadataProps) => {

  const { annotation } = props;

  const tags: W3CAnnotationBody[] = annotation.bodies.filter(b => b.purpose === 'classifying');

  const store = useAnnotationStore();

  const { getEntity } = useVocabulary();

  const schemaBodies = tags
    .map(body => ({ body, entity: getEntity(body.source) }))
    .filter(({ entity }) => entity.schema?.length > 0);

  const safeKeys = createSafeKeys(schemaBodies);

  const note = annotation.bodies.find(b => b.purpose === 'commenting');

  const noteKey = `${annotation.id}@note`;

  const initialValues = schemaBodies.reduce((initialValues, { entity, body }) => ({
    ...initialValues,
    ...Object.fromEntries(entity.schema!.map(property => ([
      safeKeys.getKey(body, property.name), 
      'properties' in body ? body.properties[property.name] || '' : '' 
    ]))),
  }), { [noteKey]: note?.value || '' });

  const formik = useFormik({
    initialValues,

    onSubmit: values => {
      const updatedTags = schemaBodies.map(({ body }) => {
        const properties = Object.entries(values).reduce((properties, [key, value]) => {
          const name = safeKeys.getName(key);

          // This will return undefined if this key is not in this body
          const expectedKey = safeKeys.getKey(body, name);

          if (expectedKey == key)
            return { ...properties, [name as string]: value };
          else
            return properties;
        }, {});

        return { annotation: props.annotation.id, ...body, properties } as AnnotationBody;
      });

      const noteBody: AnnotationBody = values[noteKey] && createBody(annotation, {
        type: 'TextualBody',
        purpose: 'commenting',
        value:  values[noteKey]
      });

      let updatedAnnotation = {
        ...store.getAnnotation(annotation.id),
        bodies: noteBody ? [...updatedTags, noteBody ] : updatedTags
      };

      store.updateAnnotation(updatedAnnotation);
    }
  });

  return schemaBodies.length > 0 ? schemaBodies.length === 1 ? (
    <form className="mt-2 px-1" onSubmit={formik.handleSubmit}>
      <EntitySchemaFields 
        body={schemaBodies[0].body}
        entity={schemaBodies[0].entity}
        safeKeys={safeKeys}
        formik={formik} />

      <CurrentSelectionNote
        body={note} 
        safeKey={noteKey}
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

      <CurrentSelectionNote
        body={note} 
        safeKey={noteKey}
        formik={formik} />

      <Button className="mt-0 h-8" type="submit">Save</Button>
    </form>
  ) : (
    <form className="mt-2 px-1" onSubmit={formik.handleSubmit}>
      <CurrentSelectionNote
        defaultOpen
        body={note} 
        safeKey={noteKey}
        formik={formik} />

      <Button className="mt-2 h-8" type="submit">Save</Button>
    </form>
  );

}