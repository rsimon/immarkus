import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { dequal } from 'dequal/lite';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { AnnotationBody, ImageAnnotation, W3CAnnotationBody, createBody } from '@annotorious/react';
import { W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import { EntityBadge } from '@/components/EntityBadge';
import { PluginConnectionsList } from '@/components/PluginConnectionsList';
import { PropertyValidation } from '@/components/PropertyFields';
import { Translation, TranslationArgs } from '@/components/Translation';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Separator } from '@/ui/Separator';
import { createSafeKeys } from './PropertyKeys';
import { RelationsList } from './RelationsList';
import { Note } from '../Note';
import { PropertiesFormSection, PropertiesFormSectionActions } from '../PropertiesFormSection';
import { PropertiesFormActions } from './PropertiesFormActions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';

const ENABLE_CONNECTOR_PLUGIN = import.meta.env.VITE_ENABLE_CONNECTOR_PLUGIN === 'true';

interface PropertiesFormProps {

  annotation: ImageAnnotation;

  onAddTag(): void;

}

const FontSizes = ['sm', 'base', 'lg', 'xl']; 

export const PropertiesForm = (props: PropertiesFormProps) => {

  const { annotation } = props;

  const anno = useAnnotoriousManifold();

  const store = useStore();

  const model = store.getDataModel();

  // Annotation bodies with purpose 'classifying' that have schemas
  const schemaBodies = useMemo(() => (annotation.bodies as unknown as W3CAnnotationBody[])
    .filter(b => b.purpose === 'classifying')
    .map(body => ({ body, entityType: model.getEntityType(body.source, true) }))
    // Robustness: users may have deleted referenced entity classes from the data model!
    .filter(({ entityType }) => Boolean(entityType))
  , [annotation]);

  // Note body, if any
  const note = annotation.bodies.find(b => b.purpose === 'commenting');

  // All other bodies
  const otherBodies = annotation.bodies.filter(b => b.purpose !== 'classifying' && b.purpose !== 'commenting');

  const safeKeys = useMemo(() => createSafeKeys(schemaBodies), [schemaBodies]);

  const noteKey = `${annotation.id}@note`;

  const initialValues = useMemo(() => (
    schemaBodies.reduce((initialValues, { entityType, body }) => ({
      ...initialValues,
      ...Object.fromEntries((entityType.properties || []).map(property => ([
        safeKeys.getKey(body, property.name), 
        'properties' in body ? body.properties[property.name] : undefined 
      ]))),
    }), { [noteKey]: note?.value })
  ), [schemaBodies]);

  const [formState, setFormState] = useState<{[key: string]: any}>(initialValues);

  const [changedRelationships, setChangedRelationships] = useState<W3CRelationMetaAnnotation[]>([]);

  const [valid, setIsValid] = useState(false);

  const [showValidationErrors, setShowValidationErrors] = useState(false); 

  useEffect(() => setFormState(initialValues), [initialValues]);

  const onDeleteBody = (body: W3CAnnotationBody) =>
    anno.deleteBody(body as unknown as AnnotationBody);
 
  const onChangeFormValue = useCallback((key: string, value: any) =>
    setFormState(state => ({
      ...state, 
      [key]: value
    })), []);

  const onChangeRelationship = useCallback((meta: W3CRelationMetaAnnotation) => (
    setChangedRelationships(state => {
      const currentValue = store.getRelationAnnotation(meta.id)?.body?.value;
      
      // Remove no-ops (happen when the user changes back to original value)
      return (meta?.body.value !== currentValue) ? [
        // Only keep latest change for this anntotation
        ...state.filter(a => a.id !== meta.id),
        meta
      ] : state.filter(a => a.id !== meta.id);
    })
  ), []);

  const hasChanges = !dequal(formState, initialValues) || changedRelationships.length > 0;
    
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
  
        return { 
          annotation: props.annotation.id, 
          ...body, 
          updated: new Date(),
          properties,
        } as unknown as AnnotationBody;
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

      // Store changed relationships, if any
      changedRelationships.forEach(meta => store.upsertRelation(undefined, meta));
      setChangedRelationships([]);
    } else {
      setShowValidationErrors(true);
    }
  }

  const hasSchemaFields = (body: W3CAnnotationBody) => {
    if (body.source) {
      const schema = model.getEntityType(body.source, true);
      return (schema?.properties || []).length > 0;
    }
  }

  const hasRelations = store.hasRelatedAnnotations(annotation.id);

  const hasNote = useMemo(() => formState[noteKey] !== undefined, [formState]);

  const [translationArgs, setTranslationArgs] = useState<TranslationArgs | undefined>();

  const [noteFontSize, setNoteFontSize] = useState('base');

  const onChangeNote = (value: string) => {
    setTranslationArgs(undefined);
    onChangeFormValue(noteKey, value)
  }

  const onChangeNoteFontSize = () => setNoteFontSize(current => {
    const currentIdx = FontSizes.indexOf(current);
    const nextIdx = (currentIdx + 1) % FontSizes.length;
    return FontSizes[nextIdx];
  });
    
  return (
    <PropertyValidation
      showErrors={showValidationErrors}
      onChange={setIsValid}>

      <form 
        className="grow pt-1 flex flex-col" 
        onSubmit={onSubmit}>
        <div className="grow">
          {schemaBodies.length === 1 ? (
            <div>
              <div className="flex justify-between items-center pt-3 pb-4">
                <EntityBadge entityType={schemaBodies[0].entityType} />

                <PropertiesFormSectionActions 
                  entityType={schemaBodies[0].entityType} 
                  onDeleteBody={() => onDeleteBody(schemaBodies[0].body)} />
              </div>

              <PropertiesFormSection 
                body={schemaBodies[0].body}
                entityType={schemaBodies[0].entityType}
                safeKeys={safeKeys}
                values={formState} 
                onChange={onChangeFormValue} />

              <Separator />
            </div>
          ) : schemaBodies.length > 1 ? (
            <Accordion type="multiple" defaultValue={schemaBodies.map(({ body }) => body.id)}>
              {schemaBodies.map(({ body, entityType }) => hasSchemaFields(body) ? (
                <AccordionItem 
                  key={body.id} 
                  value={body.id}>

                  <div className="flex justify-between items-center">
                    <div className="grow">
                      <AccordionTrigger className="hover:no-underline">
                        <EntityBadge entityType={entityType} />
                      </AccordionTrigger>
                    </div>

                    <PropertiesFormSectionActions 
                      entityType={entityType} 
                      onDeleteBody={() => onDeleteBody(body)} />
                  </div>

                  <AccordionContent>
                    <PropertiesFormSection
                      body={body}
                      entityType={entityType}
                      safeKeys={safeKeys}
                      values={formState}
                      onChange={onChangeFormValue} />
                  </AccordionContent>
                </AccordionItem>
              ) : (
                <div
                  key={body.id}
                  className="flex py-4 justify-between items-center border-b">

                  <EntityBadge entityType={entityType} />
                  
                  <PropertiesFormSectionActions 
                    entityType={entityType} 
                    onDeleteBody={() => onDeleteBody(body)} />
                </div>
              ))}
            </Accordion>
          ) : null}

          {ENABLE_CONNECTOR_PLUGIN ? (
            <PluginConnectionsList 
              annotation={annotation} />
          ) : hasRelations && (
            <RelationsList 
              annotation={annotation} 
              onUpdateRelationship={onChangeRelationship} />
          )} 

          {(hasNote || schemaBodies.length === 0) && (
            <Note
              autoFocus={schemaBodies.length === 0}
              fontSize={noteFontSize}
              id={noteKey}
              creator={note?.creator}
              value={formState[noteKey]}
              onChange={onChangeNote} />
          )}

          {translationArgs && (
            <Translation 
              args={translationArgs}
              onClose={() => setTranslationArgs(undefined)} />
          )}
          
          <PropertiesFormActions 
            hasNote={hasNote}
            onAddTag={props.onAddTag} 
            onAddNote={() => onChangeFormValue(noteKey, '')} 
            onChangeFontSize={onChangeNoteFontSize}
            onClearNote={() => onChangeFormValue(noteKey, undefined)} 
            onTranslate={(connector, service) => setTranslationArgs({ connector, service, text: formState[noteKey] })} />
        </div>

        <Button 
          disabled={!hasChanges}
          className="w-full" 
          type="submit">Save</Button> 
      </form>
    </PropertyValidation>
  )
  
}