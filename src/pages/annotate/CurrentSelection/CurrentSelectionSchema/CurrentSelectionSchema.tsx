import { useVocabulary } from '@/store';
import { ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { EntitySchemaForm } from './EntitySchemaForm';

interface CurrentSelectionSchemaProps {

  annotation: ImageAnnotation;

}

export const CurrentSelectionSchema = (props: CurrentSelectionSchemaProps) => {

  const tags: W3CAnnotationBody[] = props.annotation.bodies.filter(b => b.purpose === 'classifying');

  const { getEntity } = useVocabulary();

  const entitiesWithSchema = tags
    .map(body => getEntity(body.source))
    .filter(e => e.schema?.length > 0);

  return entitiesWithSchema.length > 0 ? entitiesWithSchema.length === 1 ? (
      <EntitySchemaForm 
        entity={entitiesWithSchema[0]}
        annotation={props.annotation} />
    ) : (
      <div>
        Multiple schemas
      </div>
    ) : null;

}