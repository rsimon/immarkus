import { ImageAnnotation } from '@annotorious/react';
import { useStore } from '@/store';
import { useEffect, useMemo, useState } from 'react';
import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { EntityBadge } from '@/components/EntityBadge';
import { getEntityTypes } from '@/utils/annotation';
import { EntityType } from '@/model';

interface AnnotationListItemRelationProps {

  leftSideAnnotation: ImageAnnotation;

  sourceId: string;

  targetId: string;

  relation?: string;

}

export const AnnotationListItemRelation = (props: AnnotationListItemRelationProps) => {

  const { leftSideAnnotation, sourceId, targetId } = props;

  const store = useStore();

  const model = store.getDataModel();

  const [entity, setEntity] = useState<EntityType |  undefined>();

  useEffect(() => {
    const rightSideId = leftSideAnnotation.id === sourceId ? targetId : sourceId;
    
    store.findAnnotation(rightSideId).then(result => {
      if (result) {
        const types = getEntityTypes(result[0]);
        if (types.length > 0)
          setEntity(model.getEntityType(types[0]));
      }
    });
  }, [leftSideAnnotation, sourceId, targetId, store])

  const type = useMemo(() => {
    if (props.relation)
      return model.getRelationshipType(props.relation);
  }, [props.relation, store]);

  return (
    <div className="w-full flex justify-between items-center py-0.5 px-2 gap-1">
      <div className="h-2.5 w-2.5 border border-gray-600 rounded-full" />

      <div className="relative flex-grow flex items-center">
        <div className="absolute border-t border-gray-600 border-dashed h-[1px] w-full z-0" />
      
        <div className="w-full flex justify-center z-10 font-light text-[11px]">
          <span className="bg-white px-1 max-w-32 whitespace-nowrap overflow-hidden text-ellipsis">{props.relation}</span>
        </div>

        {type?.directed && (
          leftSideAnnotation.id === sourceId ? (
            <div className="absolute right-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[10px] border-l-gray-600" />
          ) : (
            <div className="absolute left-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[10px] border-r-gray-600" />
          )
        )}
      </div>

      {entity ? (
        <EntityBadge 
          entityType={entity} />
      ) : (
        <div className="h-2.5 w-2.5 border border-gray-600 rounded-full" />
      )}
    </div>
  )

}