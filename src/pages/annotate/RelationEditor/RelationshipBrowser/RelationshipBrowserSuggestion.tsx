import { RelationshipType } from '@/model';
import { useDataModel } from '@/store';
import { useMemo } from 'react';

interface RelationshipBrowserSuggestionProps {

  type: RelationshipType;

  highlighted: boolean;

}

export const RelationshipBrowserSuggestion = (props: RelationshipBrowserSuggestionProps) => {

  const model = useDataModel();

  const { name, sourceTypeId, targetTypeId } = props.type;

  const sourceType = useMemo(() => {
    if (sourceTypeId) return model.getEntityType(sourceTypeId);
  }, [model, sourceTypeId]);

  const targetType = useMemo(() => {
    if (targetTypeId) return model.getEntityType(targetTypeId);
  }, [model, targetTypeId]);

  return (
    <div 
      className="flex items-center justify-between text-xs py-2 pl-2.5 pr-3.5 rounded-sm data-[highlighted]:bg-accent cursor-pointer"
      data-highlighted={props.highlighted ? 'true' : undefined}>
      {name}

      <div className="flex gap-1">
        {sourceType ? (
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: sourceType.color }} />
        ) : (
          <div className="w-2 h-2" />
        )}

        {(sourceType || targetType) ? (
          <div />
        ) : (
          <div />
        )}

        {targetType ? (
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: targetType.color }}></div>
        ) : (
          <div className="w-2 h-2" />
        )}
      </div>
    </div>
  )

}