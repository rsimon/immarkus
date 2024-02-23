import { FormEvent, useState } from 'react';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { AnnotationBody, ImageAnnotation, W3CAnnotationBody, createBody } from '@annotorious/react';
import { EntityBadge } from '@/components/EntityBadge';
import { PropertyValidation } from '@/components/PropertyFields';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { createSafeKeys } from './PropertyKeys';
import { Note } from '../Note';
import { PropertiesFormSection, PropertiesFormSectionActions } from '../PropertiesFormSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';

interface PropertiesFormProps {

  annotation: ImageAnnotation;

}

export const PropertiesForm = (props: PropertiesFormProps) => {

  const { annotation } = props;

  const anno = useAnnotoriousManifold();

  const model = useDataModel();

  // Annotation bodies with purpose 'classifying' that have schemas
  const schemaBodies = (annotation.bodies as unknown as W3CAnnotationBody[])
    .filter(b => b.purpose === 'classifying')
    .map(body => ({ body, entityType: model.getEntityType(body.source, true) }));

  // Note body, if any
  const note = annotation.bodies.find(b => b.purpose === 'commenting');

  // All other bodies
  const otherBodies = annotation.bodies.filter(b => b.purpose !== 'classifying');

  const safeKeys = createSafeKeys(schemaBodies);

  const noteKey = `${annotation.id}@note`;

  const getInitialValues = () => schemaBodies.reduce((initialValues, { entityType, body }) => ({
    ...initialValues,
    ...Object.fromEntries((entityType.properties || []).map(property => ([
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
      const updatedEntityTags = schemaBodies.map(({ body }) => {
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
          ? [...updatedEntityTags, ...otherBodies, noteBody ]
          : [...updatedEntityTags, ...otherBodies ]
      };
  
      anno.updateAnnotation(updatedAnnotation);
    } else {
      setShowValidationErrors(true);
    }
  }

  const hasSchemaFields = (body: W3CAnnotationBody) => {
    if (body.source) {
      const schema = model.getEntityType(body.source);
      return (schema?.properties || []).length > 0;
    }
  }

  return (
    <PropertyValidation
      showErrors={showValidationErrors}
      onChange={setIsValid}>

      {schemaBodies.length > 0 ? schemaBodies.length === 1 ? (
        <form className="mt-2 px-1" onSubmit={onSubmit}>
          <PropertiesFormSection 
            body={schemaBodies[0].body}
            entityType={schemaBodies[0].entityType}
            safeKeys={safeKeys}
            values={formState} 
            onChange={onChange} />

          <Note
            id={noteKey}
            value={formState[noteKey]}
            onChange={value => onChange(noteKey, value)} />

          <Button className="mt-3 h-8" type="submit">Save</Button>
        </form>
      ) : (
        <Accordion type="multiple">
          <form className="mt-2 px-1" onSubmit={onSubmit}>
            {schemaBodies.map(({ body, entityType }) => hasSchemaFields(body) ? (
              <AccordionItem 
                key={body.id} 
                value={body.id}>

                <div className="flex justify-between items-center">
                  <div className="flex-grow">
                    <AccordionTrigger >
                      <EntityBadge entityType={entityType} />
                    </AccordionTrigger>
                  </div>

                  <PropertiesFormSectionActions entityType={entityType} />
                </div>

                <AccordionContent>
                  <PropertiesFormSection
                    body={body}
                    entityType={entityType}
                    safeKeys={safeKeys}
                    values={formState}
                    onChange={onChange} />
                </AccordionContent>
              </AccordionItem>
            ) : (
              <div
                key={body.id}
                className="flex justify-between items-center border-b">
                <EntityBadge entityType={entityType} />
                <PropertiesFormSectionActions entityType={entityType} />
              </div>
            ))}

            <Note
              id={noteKey}
              value={formState[noteKey]}
              onChange={value => onChange(noteKey, value)} />

            <Button className="mt-0 h-8" type="submit">Save</Button>
          </form>
        </Accordion>
      ) : (
        <form className="mt-2 px-1" onSubmit={onSubmit}>
          <Note
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