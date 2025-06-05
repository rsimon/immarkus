import { CozyMetadata } from 'cozy-iiif';

interface IIIFMetadataListProps {

  metadata: CozyMetadata[];

  emptyMessage?: string;

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
            className="pl-4 [&_a]:text-sky-700 hover:[&_a]:underline"
            dangerouslySetInnerHTML={{ __html: value || '' }} />
        </li>
      ))}
    </ul>
  ) : (
    <div className="flex items-center justify-center h-full min-h-16 text-muted-foreground text-sm">
      {props.emptyMessage || 'No IIIF Metadata'}
    </div>
  )

}