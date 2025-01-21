import { CozyMetadata } from '@/utils/cozy-iiif';

interface IIIFMetadataListProps {

  metadata: CozyMetadata[];

}

export const IIIFMetadataList = (props: IIIFMetadataListProps) => {

  return props.metadata.length > 0 ? (
    <ul className="h-full space-y-4 text-sm leading-relaxed pt-8 py-4 px-1">
      {props.metadata.map(({ label, value }, index) => (
        <li key={`${label}:${index}`}>
          <div 
            className="font-semibold">
            {label}
          </div>
          
          <div 
            className="pl-4 [&_a]:text-sky-700 [&_a]:hover:underline"
            dangerouslySetInnerHTML={{ __html: value || '' }} />
        </li>
      ))}
    </ul>
  ) : (
    <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
      No IIIF Metadata
    </div>
  )

}