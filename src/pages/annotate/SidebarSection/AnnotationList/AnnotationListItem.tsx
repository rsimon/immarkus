import Moment from 'react-moment';
import { ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { EntityBadge } from '@/components/EntityBadge';
import { PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { serializePropertyValue } from '@/utils/serialize';
import { AnnotationListItemActions } from './AnnotationListItemActions';

interface AnnotationListItemProps {

  annotation: ImageAnnotation;

  onSelect(): void;

  onDelete(): void;

}

const getValuePreviewsForSchema = (schema: PropertyDefinition[], body: W3CAnnotationBody) => {
  if ('properties' in body) {
    return schema.reduce<string[]>((previews, definition) => {
      const value = body.properties[definition.name];
      if (value) {
        const serialized = serializePropertyValue(definition, value);
        return [...previews, serialized ];
      } else {
        return previews;
      }
    }, []);
  } else {
    return [];  
  }
}

export const AnnotationListItem = (props: AnnotationListItemProps) => {

  const { getEntityType } = useDataModel();

  const entityTags: W3CAnnotationBody[] = 
    props.annotation.bodies.filter(b => b.purpose === 'classifying') as unknown as W3CAnnotationBody[];

  const note = props.annotation.bodies.find(b => b.purpose === 'commenting');

  const isEmpty = !note && entityTags.length === 0;

  const timestamps = props.annotation.bodies
    .map(b => b.created)
    .filter(Boolean)
    .map(d => new Date(d))
    .slice().sort();

  const lastEdit = timestamps.length > 0 ? timestamps[timestamps.length - 1] : undefined;

  const valuePreviews = entityTags.reduce<string[]>((values, body) => {
    const schema = getEntityType(body.source);
    if (schema) {
      return [...values, ...getValuePreviewsForSchema(schema.properties || [], body)];
    } else {
      console.error('Reference to missing entity class:', body.source);
      return values;
    }
  }, []);

  return (
    <div className="relative border mb-2 rounded text-xs shadow-sm px-2 pt-2.5 pb-2 bg-white">
      {entityTags.length > 0 && (
        <ul 
          className="line-clamp-1 mr-8">
          {entityTags.map(tag => (
            <li key={tag.id} className="inline-block mr-1 mb-1 whitespace-nowrap">
              <EntityBadge 
                entityType={getEntityType(tag.source)} />
            </li>
          ))}
        </ul>
      )}

      <div className="px-0.5 pt-1">
        {valuePreviews.join(' · ')}
      </div>
    
      {note && (
        <p className="line-clamp-2 pl-0.5 pr-5 pt-1 pb-0.5 italic text-muted-foreground">
          {note.value}
        </p>
      )}

      {isEmpty && (
        <div className="pt-3.5 pb-5 flex justify-center text-muted-foreground">
          Empty annotation
        </div>
      )}

      {lastEdit && (
        <div className="text-xs text-muted-foreground/80 px-1 pt-1">
          <Moment format="LT MMM DD">
            {lastEdit}
          </Moment>
        </div>
      )}

      <AnnotationListItemActions 
        onSelectAnnotation={props.onSelect} 
        onDeleteAnnotation={props.onDelete} />
    </div>
  )

}