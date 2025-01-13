import { ImageSnippet } from '@/utils/getImageSnippet';

interface RelationshipThumbnailProps {

  directed?: boolean;

  fromSnippet: ImageSnippet;

  toSnippet: ImageSnippet;

  label?: string

  outbound: boolean;

}

export const RelationshipThumbnail = (props: RelationshipThumbnailProps) => {

  const { fromSnippet, toSnippet } = props;

  const className = 'w-14 h-14 object-cover aspect-square rounded-sm border';

  return props.outbound ? (
    <div className="flex justify-between p-2.5 border-t items-center gap-2 text-xs">
      <img
        src={'src' in fromSnippet 
          ? fromSnippet.src
          : URL.createObjectURL(new Blob([fromSnippet.data]))}
        className={className} />

      <div className="flex-grow flex justify-center h-[1px] border-gray-600 border-t border-dashed relative whitespace-nowrap">
        <div className="absolute -top-[0.675rem] w-full text-center overflow-hidden max-w-[70%] text-ellipsis">
          <span className="bg-white px-1 font-light">{props.label || ''}</span>
        </div>

        {props.directed && (
          <div className="absolute -right-0.5 -top-[4.5px] border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[12px] border-l-gray-600" />
        )}
      </div>

      <img
        src={'src' in toSnippet 
          ? toSnippet.src
          : URL.createObjectURL(new Blob([toSnippet.data]))}
        className={className} />
    </div>
  ) : (
    <div className="flex justify-between p-2.5 border-t items-center gap-3 text-xs">
      <img
        src={'src' in toSnippet 
          ? toSnippet.src
          : URL.createObjectURL(new Blob([toSnippet.data]))}
        className={className} />

      <div className="flex-grow h-[1px] border-gray-400 border-t border-dashed relative">
        {props.directed && (
          <div className="absolute -left-0.5 -top-[5.5px] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[12px] border-r-gray-400" />
        )}
        
        <div className="absolute -top-[0.675rem] w-full text-center">
          <span className="bg-white px-1 font-light text-muted-foreground">{props.label || ''}</span>
        </div>
      </div>

      <img
        src={'src' in fromSnippet 
          ? fromSnippet.src
          : URL.createObjectURL(new Blob([fromSnippet.data]))}
        className={className} />
    </div>
  )

}