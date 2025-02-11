import { useEffect, useMemo, useState } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { EntityBadge } from '@/components/EntityBadge';
import { EntityType } from '@/model';
import { useStore } from '@/store';
import { getEntityTypes } from '@/utils/annotation';

interface AnnotationListItemRelationProps {

  leftSideAnnotation: ImageAnnotation;

  sourceId: string;

  targetId: string;

  relation?: string;

  onClickSource(): void;

  onClickTarget(): void;

}

export const AnnotationListItemRelation = (props: AnnotationListItemRelationProps) => {

  const { leftSideAnnotation, sourceId, targetId } = props;

  const rightSideId = leftSideAnnotation.id === sourceId ? targetId : sourceId;

  const store = useStore();

  const model = store.getDataModel();

  const [entity, setEntity] = useState<EntityType |  undefined>();

  useEffect(() => {
    store.findAnnotation(rightSideId).then(result => {
      if (result) {
        const types = getEntityTypes(result[0]);
        if (types.length > 0)
          setEntity(model.getEntityType(types[0]));
      }
    });
  }, [rightSideId, store])

  const type = useMemo(() => {
    if (props.relation)
      return model.getRelationshipType(props.relation);
  }, [props.relation, store]);

  return (
    <div className="w-full flex justify-between items-center py-0.5 px-2 gap-1">
      <button 
        className="shrink-0 rounded-full"
        onClick={leftSideAnnotation.id === sourceId ? props.onClickSource : props.onClickTarget}>
        <AnnotationThumbnail 
          className="rounded-full h-7 w-7 border border-gray-400"
          annotation={leftSideAnnotation} />
      </button>

      <div className="relative grow flex items-center justify-center">
        <div className="absolute border-t border-gray-600 border-dashed h-[1px] w-full z-0" />
      
        <div className="w-[85%] flex justify-center z-10 font-light text-[11px]">
          <span className="bg-white px-1 max-w-28 whitespace-nowrap overflow-hidden text-ellipsis">{props.relation}</span>
        </div>

        {type?.directed && (
          leftSideAnnotation.id === sourceId ? (
            <div className="absolute -right-0.5 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[10px] border-l-gray-600" />
          ) : (
            <div className="absolute -left-0.5 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[10px] border-r-gray-600" />
          )
        )}
      </div>

      <div className="flex gap-1 items-center">
        <button
          className="shrink-0 rounded-full"
          onClick={rightSideId === targetId ? props.onClickTarget : props.onClickSource}>
          <AnnotationThumbnail 
            className="rounded-full h-7 w-7 border border-gray-400"
            annotation={rightSideId} />
        </button>

        {entity && (
          <EntityBadge 
            className="h-7"
            entityType={entity} />
        )}
      </div>
    </div>
  )

}