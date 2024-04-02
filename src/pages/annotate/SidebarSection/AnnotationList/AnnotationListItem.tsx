import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Moment from 'react-moment';
import { ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { EntityBadge } from '@/components/EntityBadge';
import { ExternalAuthority, PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { serializePropertyValue } from '@/utils/serialize';
import { ReactNode } from 'react';
import { formatIdentifier } from '@/components/PropertyFields/ExternalAuthorityField/util';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';

interface AnnotationListItemProps {

  annotation: ImageAnnotation;

  onEdit(): void;

  onDelete(): void;

}

const getValuePreviewsForSchema = (
  schema: PropertyDefinition[], 
  body: W3CAnnotationBody, 
  authorities: ExternalAuthority[]
) => {
  if ('properties' in body) {
    return schema.reduce<ReactNode[]>((previews, definition) => {
      const value = body.properties[definition.name];
      if (value) {
        const serialized = serializePropertyValue(definition, value);

        const node = 
          definition.type === 'uri' ? 
            (<a href={serialized} target="_blank" className="text-sky-700 hover:underline">{serialized}</a>) :
          definition.type === 'external_authority' 
            ? (<a href={value} target="_blank" className="text-sky-700 hover:underline">{formatIdentifier(value, authorities)}</a>)
            : (<span>{serialized}</span>);

        return [...previews, node ];
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

  const { authorities } = useRuntimeConfig();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const entityTags: W3CAnnotationBody[] = 
    props.annotation.bodies.filter(b => b.purpose === 'classifying') as unknown as W3CAnnotationBody[];

  const note = props.annotation.bodies.find(b => b.purpose === 'commenting');

  const isEmpty = !note && entityTags.length === 0;

  const timestamps = [
    props.annotation.target.created,
    ...props.annotation.bodies.map(b => b.created)
  ].filter(Boolean).map(d => new Date(d));

  const lastEdit = timestamps.length > 0 ? timestamps[timestamps.length - 1] : undefined;

  const valuePreviews = entityTags.reduce<ReactNode[]>((values, body) => {
    const schema = getEntityType(body.source, true);
    if (schema) {
      return [...values, ...getValuePreviewsForSchema(schema.properties || [], body, authorities)];
    } else {
      console.error('Reference to missing entity class:', body.source);
      return values;
    }
  }, []);

  return (
    <>
      <div className="relative border mb-2 rounded text-xs shadow-sm px-2 pt-2.5 pb-2 bg-white cursor-pointer">
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

        <div className="line-clamp-2 px-0.5 pt-1">
          {valuePreviews.map((node, idx) =>
            <span key={`n-${idx}`}>{node} {(idx < valuePreviews.length - 1) && ' · '}</span>
          )}
        </div>
      
        {note && (
          <p className="line-clamp-2 pl-0.5 pr-5 pt-1 pb-0.5 italic text-muted-foreground">
            {note.value}
          </p>
        )}

        {isEmpty && (
          <div className="pt-3.5 flex justify-center text-muted-foreground">
            Empty annotation
          </div>
        )}

        <div className="pl-0.5 pt-3 flex justify-between items-center">
          {lastEdit ? (
            <div className="text-gray-400">
              <Moment format="LT MMM DD">
                {lastEdit}
              </Moment>
            </div>
          ) : (
            <div />
          )}

          <div className="flex">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8 text-gray-400 hover:text-black"
              onClick={props.onEdit}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>

            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full h-8 w-8 -ml-1.5 text-red-400 hover:text-red-600"
              onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <ConfirmedDelete
        open={confirmDelete}
        label="This action will delete the annotation permanently."
        onConfirm={props.onDelete}
        onOpenChange={setConfirmDelete} />
    </>
  )

}