import { useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import type { ImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '../AnnotationThumbnail';
import { Button } from '@/ui/Button';

interface RelationsListItemProps {

  referenceAnnotation: ImageAnnotation;

  fromId: string;

  toId: string;

  relationship?: string;

  onDelete(): void;

}

export const RelationsListItem = (props: RelationsListItemProps) => {

  const { fromId, toId, relationship } = props;

  const refId = props.referenceAnnotation.id;    

  const onDelete = useCallback((evt: React.MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
    props.onDelete();
  }, []);

  return (
    <div className="flex items-center w-full">
      <div className="flex flex-grow items-center justify-between px-1 py-1.5 text-xs gap-2">
        <div className={fromId === refId ? undefined : 'p-1.5'}>
          <AnnotationThumbnail 
            annotation={fromId} 
            className={fromId === refId ? 'border shadow-sm h-12 w-12' : 'border shadow-sm h-9 w-9'} /> 
        </div>

        <div className="flex-grow h-[1px] relative text-muted-foreground">
          <svg 
            width="100%" 
            height={18}
            className="absolute overflow-visible top-1/2 -mt-[10px] opacity-60">
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="9" refX="8" refY="3.5" orient="auto">
                <line x1="0" y1="0" x2="8" y2="3.5" stroke="currentColor" />
                <line x1="0" y1="7" x2="7" y2="3.5" stroke="currentColor" />
              </marker>
            </defs>

            <line x1="0" y1="10" x2="100%" y2="10" stroke="currentColor" strokeWidth="1.2" markerEnd="url(#arrowhead)" />
          </svg>
          
          <div className="absolute -top-[0.625rem] w-full text-center">
            <span 
              className="bg-white inline-block px-1 font-light text-muted-foreground whitespace-nowrap max-w-[80%] overflow-hidden text-ellipsis">
              {relationship || 'to'}
            </span>
          </div>
        </div>

        <div className={toId === refId ? undefined : 'p-1.5'}>
          <AnnotationThumbnail 
            annotation={props.toId} 
            className={toId === refId ? 'border shadow-sm h-12 w-12' : 'border shadow-sm h-9 w-9'} />
        </div>
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