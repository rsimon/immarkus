import { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Moment from 'react-moment';
import { ImageAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { useInView } from 'react-intersection-observer';
import { EntityBadge } from '@/components/EntityBadge';
import { useDataModel, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { AnnotationValuePreview } from '@/components/AnnotationValuePreview';
import { AnnotationListItemRelation } from './AnnotationListItemRelation';

interface AnnotationListItemProps {

  annotation: ImageAnnotation;

  onEdit(): void;

  onDelete(): void;

}

export const AnnotationListItem = (props: AnnotationListItemProps) => {

  const store = useStore();

  const { ref, inView } = useInView();

  const { getEntityType } = useDataModel();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const entityTags: W3CAnnotationBody[] = 
    props.annotation.bodies.filter(b => b.purpose === 'classifying') as unknown as W3CAnnotationBody[];

  const relations = useMemo(() => store.getRelatedAnnotations(props.annotation.id), [props.annotation]);

  const note = props.annotation.bodies.find(b => b.purpose === 'commenting');

  const isEmpty = !note && entityTags.length === 0;

  const timestamps = [
    props.annotation.target.created,
    ...props.annotation.bodies.map(b => b.created)
  ].filter(Boolean).map(d => new Date(d));

  const lastEdit = timestamps.length > 0 ? timestamps[timestamps.length - 1] : undefined;

  return (
    <>
      <div 
        ref={ref}
        className="relative border mb-2 rounded text-xs bg-white cursor-pointer">
        {entityTags.length > 0 && (
          <ul 
            className="line-clamp-1 mr-8 px-2 py-3">
            {entityTags.map(tag => (
              <li key={tag.id} className="inline-block mr-1 whitespace-nowrap">
                <EntityBadge 
                  entityType={getEntityType(tag.source)} />
              </li>
            ))}
          </ul>
        )}

        <div className="line-clamp-2 px-2.5 mb-2">
          <AnnotationValuePreview 
            bodies={entityTags} />
        </div>
      
        {note && (
          <p className="line-clamp-2 pl-2.5 pr-5 pt-0 pb-3 font-light text-muted-foreground">
            {note.value}
          </p>
        )}

        {isEmpty && (
          <div className="py-6 flex justify-center text-muted-foreground">
            Empty annotation
          </div>
        )}

        {(inView && relations.length > 0) && (
          <ul className="rounded-b border-slate-200/80 space-y-1 px-1 pb-2.5">
            {relations.map(([link, meta]) => (
              <AnnotationListItemRelation
                key={link.id}
                leftSideAnnotation={props.annotation} 
                sourceId={link.target} 
                targetId={link.body} 
                relation={meta?.body?.value} />
            ))}
          </ul>
        )}

        <div className="bg-slate-50 border-t py-0.5 pl-2.5 pr-1 flex justify-between items-center text-[11px]">
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
              className="rounded-full h-8 w-8 -ml-1.5 text-gray-400 hover:text-red-600"
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