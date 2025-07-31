import type { ImageAnnotation } from '@annotorious/react';
import { AnnotationThumbnail } from '../AnnotationThumbnail';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';

interface PluginConnectionsListItemProps {

  referenceAnnotation: ImageAnnotation;

  link: W3CRelationLinkAnnotation;

  meta?: W3CRelationMetaAnnotation;

}

export const PluginConnectionsListItem = (props: PluginConnectionsListItemProps) => {

  const { link, meta } = props;

  const refId = props.referenceAnnotation.id;    

  const fromId = link.target;

  const toId = link.body;

  const relationship = Array.isArray(meta?.body) ? meta.body[0].value : meta?.body?.value || 'to';

  return (
    <div className="flex items-center w-full justify-between px-1 py-1.5 text-xs gap-2">
      <div className={fromId === refId ? undefined : 'p-1.5'}>
        <AnnotationThumbnail 
          annotation={fromId} 
          className={fromId === refId ? 'shadow-sm h-12 w-12' : 'shadow-sm h-9 w-9'} /> 
      </div>

      <div className="grow h-[1px] border-gray-700 border-t border-dashed relative">
        <div className="absolute -top-[0.75rem] w-full text-center">
          <span className="bg-white px-1">{relationship}</span>
        </div>
        <div className="absolute -right-0.5 -top-[5.5px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[12px] border-l-gray-700"></div>
      </div>

      <div className={toId === refId ? undefined : 'p-1.5'}>
        <AnnotationThumbnail 
          annotation={toId} 
          className={toId === refId ? 'shadow-sm h-12 w-12' : 'shadow-sm h-9 w-9'} />
      </div>
    </div>
  )

}