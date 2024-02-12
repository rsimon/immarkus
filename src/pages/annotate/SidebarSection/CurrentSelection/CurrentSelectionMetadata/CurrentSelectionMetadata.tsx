import { FormEvent, useState } from 'react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { 
  AnnotationBody, 
  ImageAnnotation, 
  W3CAnnotationBody, 
  createBody
} from '@annotorious/react';
import { PropertyValidation } from '@/components/PropertyFields';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { EntityProperties } from './EntityProperties';
import { createSafeKeys } from './PropertyKeys';
import { CurrentSelectionNote } from './CurrentSelectionNote';

interface CurrentSelectionMetadataProps {

  annotation: ImageAnnotation;

}

export const CurrentSelectionMetadata = (props: CurrentSelectionMetadataProps) => {

  const { annotation } = props;

  const anno = useAnnotoriousManifold();

  const model = useDataModel();

  // Annotation bodies with purpose 'classifying' that have schemas
  const schemaBodies = (annotation.bodies as unknown as W3CAnnotationBody[])
    .filter(b => b.purpose === 'classifying')
    .map(body => ({ body, entityType: model.getEntityType(body.source, true) }))
    .filter(({ entityType }) => entityType?.properties?.length > 0);

  // Note body, if any
  const note = annotation.bodies.find(b => b.purpose === 'commenting');

  // All other bodies
  const otherBodies = annotation.bodies.filter(b => {
    if (b.purpose === 'classifying') {
      const entity = model.getEntityType((b as unknown as W3CAnnotationBody).source, true);
      return (!entity?.properties || entity.properties.length === 0);
    } else {
      return b.purpose !== 'commenting';
    }
  });

  const safeKeys = createSafeKeys(schemaBodies);

  const noteKey = `${annotation.id}@note`;

  const getInitialValues = () => schemaBodies.reduce((initialValues, { entityType, body }) => ({
    ...initialValues,
    ...Object.fromEntries(entityType.properties!.map(property => ([
      safeKeys.getKey(body, property.name), 
      'properties' in body ? body.properties[property.name] : undefined 
    ]))),
  }), { [noteKey]: note?.value });

  const [formState, setFormState] = useState<{[key: string]: any}>(getInitialValues());

  const [valid, setIsValid] = useState(false);

  const [showValidationErrors, setShowValidationErrors] = useState(false); 
 
  const onChange = (key: string, value: any) =>
    setFormState(state => ({
      ...state, 
      [key]: value
    }));

  const onSubmit = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    if (valid) {
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
  
        return { annotation: props.annotation.id, ...body, properties } as unknown as AnnotationBody;
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
    } else {
      setShowValidationErrors(true);
    }
  }

  return (
    <PropertyValidation
      showErrors={showValidationErrors}
      onChange={setIsValid}>

      {schemaBodies.length > 0 ? schemaBodies.length === 1 ? (
        <form className="mt-2 px-1" onSubmit={onSubmit}>
          <EntityProperties 
            body={schemaBodies[0].body}
            entityType={schemaBodies[0].entityType}
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
          {schemaBodies.map(({ body, entityType }) => (
            <div key={body.id} className="pb-4">
              <h3 className="text-xs font-semibold mt-3 text-muted-foreground">
                {entityType.label}
              </h3>

              <EntityProperties
                body={body}
                entityType={entityType}
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
      )}

    </PropertyValidation>
  )
  
}