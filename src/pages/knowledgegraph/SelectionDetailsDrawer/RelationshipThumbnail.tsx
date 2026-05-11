import { useMemo } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/ui/HoverCard';
import { ImageSnippet } from '@/utils/getImageSnippet';

interface RelationshipThumbnailProps {

  directed?: boolean;

  fromSnippet: ImageSnippet;

  toSnippet: ImageSnippet;

  label?: string

  outbound: boolean;

}

interface PreviewableThumbnailProps {

  snippet: ImageSnippet;

}

const PreviewableThumbnail = (props: PreviewableThumbnailProps) => {
  const className = 'w-14 h-14 object-cover aspect-square rounded-sm border';

  const src = useMemo(() => 'src' in props.snippet 
    ? props.snippet.src
    : URL.createObjectURL(new Blob([props.snippet.data as BlobPart])), [props.snippet]);

  return (
    <HoverCard>
      <HoverCardTrigger>
        <img
          src={src}
          className={className} />
      </HoverCardTrigger>

      <HoverCardContent            
        className="p-0 shadow-xl border-none overflow-hidden min-w-0 w-auto"
        align="center"
        side="left"
        collisionPadding={20}>
        <img 
          className="rounded max-w-70 max-h-70" 
          src={src} />
      </HoverCardContent>
    </HoverCard>
  )

}

export const RelationshipThumbnail = (props: RelationshipThumbnailProps) => {
  const { fromSnippet, toSnippet } = props;

  return props.outbound ? (
    <div className="flex justify-between p-2.5 border-t items-center gap-2 text-xs">
      <PreviewableThumbnail
        snippet={fromSnippet} />

      <div className="grow flex justify-center h-px border-gray-600 border-t border-dashed relative whitespace-nowrap">
        <div className="absolute top-[-0.675rem] w-full text-center overflow-hidden max-w-[70%] text-ellipsis">
          <span className="bg-white px-1 font-light">{props.label || ''}</span>
        </div>

        {props.directed && (
          <div className="absolute -right-0.5 top-[-4.5px] border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-12 border-l-gray-600" />
        )}
      </div>

      <PreviewableThumbnail
        snippet={toSnippet} />
    </div>
  ) : (
    <div className="flex justify-between p-2.5 border-t items-center gap-3 text-xs">
      <PreviewableThumbnail
        snippet={toSnippet} />

      <div className="grow h-px border-gray-400 border-t border-dashed relative">
        {props.directed && (
          <div className="absolute -left-0.5 top-[-5.5px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-12 border-r-gray-400" />
        )}
        
        <div className="absolute top-[-0.675rem] w-full text-center">
          <span className="bg-white px-1 font-light text-muted-foreground">{props.label || ''}</span>
        </div>
      </div>

      <PreviewableThumbnail
        snippet={fromSnippet} />
    </div>
  )

}