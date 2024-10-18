import { RelationshipType } from '@/model';
import { useDataModel } from '@/store';
import { useMemo } from 'react';
import { RelationshipSearchResult } from './useRelationshipSearch';

interface RelationshipBrowserSuggestionProps {

  type: RelationshipSearchResult;

  highlighted: boolean;

}

const RelationshipArrow = (props: { directed: boolean }) => {

  return (
    <div className="flex-grow h-[1px] relative text-muted-foreground w-3">
      <svg 
        width="100%" 
        height={14}
        className="absolute overflow-visible top-1/2 -mt-[7px] opacity-60">
        <defs>
          <marker id="arrowhead" markerWidth="5" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <line x1="0" y1="0" x2="5" y2="3.5" stroke="#000"  />
            <line x1="0" y1="7" x2="5" y2="3.5" stroke="#000" />
          </marker>
        </defs>

        <line x1="0" y1="10" x2="100%" y2="10" stroke="#000" markerEnd={props.directed ? 'url(#arrowhead)' : undefined} />
      </svg>
    </div>
  )

}

export const RelationshipBrowserSuggestion = (props: RelationshipBrowserSuggestionProps) => {

  const model = useDataModel();

  const { name, sourceTypeId, targetTypeId, isApplicable, directed } = props.type;

  const sourceType = useMemo(() => {
    if (sourceTypeId) return model.getEntityType(sourceTypeId);
  }, [model, sourceTypeId]);

  const targetType = useMemo(() => {
    if (targetTypeId) return model.getEntityType(targetTypeId);
  }, [model, targetTypeId]);

  return (
    <div 
      className="flex items-center border-b justify-between text-xs data-[not-applicable]:text-muted-foreground/60 py-2 pl-2 pr-2.5 rounded-sm cursor-pointer data-[highlighted]:bg-accent"
      data-highlighted={(isApplicable && props.highlighted) ? 'true' : undefined}
      data-not-applicable={isApplicable ? undefined : 'true'}>
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">{name}</span>

      <div className="flex gap-0">
        {sourceType ? (
          <div 
            className="w-[7px] h-[7px] rounded-full" 
            style={{ backgroundColor: sourceType.color}} />
        ) : (
          <div className="w-[7px] h-[7px] " />
        )}

        {(sourceType || targetType) ? (
          <RelationshipArrow directed={directed} />
        ) : (
          <div />
        )}

        {targetType ? (
          <div 
            className="w-[7px] h-[7px] rounded-full" 
            style={{ backgroundColor: targetType.color }}></div>
        ) : (
          <div className="w-[7px] h-[7px]" />
        )}
      </div>
    </div>
  )

}