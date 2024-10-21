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
    <div className="w-full flex justify-between items-center py-0.5 px-2">
      <div className="h-2 w-2 border border-gray-400 rounded-full" />

      <div className="relative flex-grow flex items-center">
        <div className="absolute border-t border-gray-400 border-dashed h-[1px] w-full z-0" />
      
        <div className="w-full flex justify-center z-10 font-light text-[11px]">
          <span className="bg-slate-50 px-1">{props.relation}</span>
        </div>
      </div>

      {entity && (
        <EntityBadge 
          entityType={entity} />
      )}
    </div>
  )

}