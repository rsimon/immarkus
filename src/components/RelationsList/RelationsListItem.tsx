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

        <div className="flex-grow h-[1px] border-gray-400 border-t border-dashed relative">
          <div className="absolute -top-[0.75rem] w-full text-center">
            <span className="bg-white px-1 font-light text-muted-foreground">{relationship || 'to'}</span>
          </div>
          <div className="absolute -right-0.5 -top-[5.5px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[12px] border-l-gray-400"></div>
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