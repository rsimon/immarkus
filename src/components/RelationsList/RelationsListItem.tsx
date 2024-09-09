import type { ImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '../AnnotationThumbnail';

interface RelationsListItemProps {

  referenceAnnotation: ImageAnnotation;

  fromId: string;

  toId: string;

  relationship?: string;

}

export const RelationsListItem = (props: RelationsListItemProps) => {

  const { fromId, toId, relationship } = props;

  const refId = props.referenceAnnotation.id;    

  return (
    <div className="flex items-center w-full justify-between px-1 py-1.5 text-xs gap-2">
      <div className={fromId === refId ? undefined : 'p-1.5'}>
        <AnnotationThumbnail 
          annotation={fromId} 
          className={fromId === refId ? 'shadow h-12 w-12' : 'shadow h-9 w-9'} /> 
      </div>

      <div className="flex-grow h-[1px] border-gray-500 border-t-2 border-dashed relative">
        <div className="absolute -top-[0.75rem] w-full text-center">
          <span className="bg-white px-1">{props.relationship || 'to'}</span>
        </div>
        <div className="absolute -right-0.5 -top-[6px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[12px] border-l-gray-500"></div>
      </div>

      <div className={toId === refId ? undefined : 'p-1.5'}>
        <AnnotationThumbnail 
          annotation={props.toId} 
          className={toId === refId ? 'shadow h-12 w-12' : 'shadow h-9 w-9'} />
      </div>
    </div>
  )

}