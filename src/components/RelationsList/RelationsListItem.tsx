import { useCallback, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { AnnotationThumbnail } from '../AnnotationThumbnail';
import { Button } from '@/ui/Button';
import { useDataModel } from '@/store';

interface RelationsListItemProps {

  // ID of the annotation to appear on the left
  leftSideId: string;

  sourceId: string;

  targetId: string;

  relationship?: string;

  onDelete(): void;

}

export const RelationsListItem = (props: RelationsListItemProps) => {

  const model = useDataModel();

  const { leftSideId, sourceId, targetId, relationship } = props;

  // Can be undefined if the user has meanwhile deleted the 
  // relationship type from the data model!
  const relationshipType = useMemo(() => 
    model.getRelationshipType(relationship), [model, relationship]);

  // Is the arrow left-to-right or other right-to-left?
  const ltr = relationshipType?.directed
    ? leftSideId === sourceId : false;  

  const markerId = useMemo(() => `arrowhead-${sourceId}-${targetId}`, [sourceId, targetId]);

  const onDelete = useCallback((evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    props.onDelete();
  }, []);

  return (
    <div className="flex items-center w-full">
      <div className="flex flex-grow items-center justify-between px-1 py-1.5 text-xs gap-2">
        <AnnotationThumbnail 
          annotation={leftSideId === sourceId ? sourceId : targetId} 
          className="border shadow-sm h-12 w-12" /> 

        <div className="flex-grow h-[1px] relative text-muted-foreground">
          <svg 
            width="100%" 
            height={18}
            className="absolute overflow-visible top-1/2 -mt-[10px] opacity-60">
            <defs>
              <marker 
                id={markerId} 
                markerWidth="6" 
                markerHeight="7" 
                refX="6" 
                refY="3" 
                orient={ltr ? '0' : '180'}>
                <line x1="0" y1="0" x2="6" y2="3" stroke="currentColor" />
                <line x1="0" y1="6" x2="6" y2="3" stroke="currentColor" />
              </marker>
            </defs>

            <line 
              x1="0" 
              y1="10" 
              x2="100%" 
              y2="10" 
              stroke="currentColor"
              strokeWidth="1.25" 
              markerStart={relationshipType?.directed && !ltr ? `url(#${markerId})` : undefined}
              markerEnd={relationshipType?.directed && ltr ? `url(#${markerId})` : undefined} />
          </svg>
          
          <div className="absolute -top-[0.625rem] w-full text-center">
            <span 
              className="bg-white inline-block px-1 font-light text-muted-foreground whitespace-nowrap max-w-[80%] overflow-hidden text-ellipsis">
              {relationship || 'to'}
            </span>
          </div>
        </div>

        <AnnotationThumbnail 
          annotation={leftSideId === sourceId ? targetId : sourceId} 
          className="border shadow-sm h-12 w-12" />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-full"
        onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

}