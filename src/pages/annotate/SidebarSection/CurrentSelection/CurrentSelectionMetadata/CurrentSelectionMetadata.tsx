import { FormEvent, useState } from 'react';
import { 
  AnnotationBody, 
  ImageAnnotation, 
  W3CAnnotationBody, 
  createBody
} from '@annotorious/react';
import { useVocabulary } from '@/store';
import { Button } from '@/ui/Button';
import { EntitySchemaFields } from './EntitySchemaFields';
import { createSafeKeys } from './PropertyKeys';
import { CurrentSelectionNote } from './CurrentSelectionNote';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';

interface CurrentSelectionMetadataProps {

  annotation: ImageAnnotation;

}

export const CurrentSelectionMetadata = (props: CurrentSelectionMetadataProps) => {

  const { annotation } = props;

  const anno = useAnnotoriousManifold();

  const { getEntity } = useVocabulary();

  // Annotation bodies with purpose 'classifying' that have schemas
  const schemaBodies = (annotation.bodies as W3CAnnotationBody[])
    .filter(b => b.purpose === 'classifying')
    .map(body => ({ body, entity: getEntity(body.source) }))
    .filter(({ entity }) => entity?.schema?.length > 0);

  // Note body, if any
  const note = annotation.bodies.find(b => b.purpose === 'commenting');

  // All other bodies
  const otherBodies = annotation.bodies.filter(b => {
    if (b.purpose === 'classifying') {
      const entity = getEntity((b as W3CAnnotationBody).source);
      return (!entity?.schema || entity.schema.length === 0);
    } else {
      return b.purpose !== 'commenting';
    }
  });

  const safeKeys = createSafeKeys(schemaBodies);

  const noteKey = `${annotation.id}@note`;

  const getInitialValues = () => schemaBodies.reduce((initialValues, { entity, body }) => ({
    ...initialValues,
    ...Object.fromEntries(entity.schema!.map(property => ([
      safeKeys.getKey(body, property.name), 
      'properties' in body ? body.properties[property.name] : undefined 
    ]))),
  }), { [noteKey]: note?.value });

  const [formState, setFormState] = useState<{[key: string]: string}>(getInitialValues());

  const onChange = (key: string, value: any) =>
    setFormState(state => ({
      ...state, 
      [key]: value
    }));

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const updatedTags = schemaBodies.map(({ body }) => {
      const properties = Object.entries(formState).reduce((properties, [key, value]) => {
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

    const noteBody: AnnotationBody = formState[noteKey] && createBody(annotation, {
      type: 'TextualBody',
      purpose: 'commenting',
      value: formState[noteKey]
    });

    let updatedAnnotation = {
      ...anno.getAnnotation(annotation.id),
      bodies: noteBody 
        ? [...updatedTags, ...otherBodies, noteBody ]
        : [...updatedTags, ...otherBodies ]
    };

    anno.updateAnnotation(updatedAnnotation);
  }

  return schemaBodies.length > 0 ? schemaBodies.length === 1 ? (
    <form className="mt-2 px-1" onSubmit={onSubmit}>
      <EntitySchemaFields 
        body={schemaBodies[0].body}
        entity={schemaBodies[0].entity}
        safeKeys={safeKeys}
        values={formState} 
        onChange={onChange} />

      <CurrentSelectionNote
        id={noteKey}
        value={formState[noteKey]}
        onChange={value => onChange(noteKey, value)} />

      <Button className="mt-3 h-8" type="submit">Save</Button>
    </form>
  ) : (
    <form className="mt-2 px-1" onSubmit={onSubmit}>
      {schemaBodies.map(({ body, entity }, idx) => (
        <div key={body.id} className="pb-4">
          <h3 className="text-xs font-semibold mt-3 text-muted-foreground">
            {entity.label}
          </h3>

          <EntitySchemaFields
            body={body}
            entity={entity}
            safeKeys={safeKeys}
            values={formState}
            onChange={onChange} />
        </div>
      ))}

      <CurrentSelectionNote
        id={noteKey}
        value={formState[noteKey]}
        onChange={value => onChange(noteKey, value)} />

      <Button className="mt-0 h-8" type="submit">Save</Button>
    </form>
  ) : (
    <form className="mt-2 px-1" onSubmit={onSubmit}>
      <CurrentSelectionNote
        defaultOpen
        id={noteKey}
        value={formState[noteKey]}
        onChange={value => onChange(noteKey, value)} />

      <Button className="mt-2 h-8" type="submit">Save</Button>
    </form>
  );

}