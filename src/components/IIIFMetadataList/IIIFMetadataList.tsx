import { Annotation, CozyMetadata } from 'cozy-iiif';
import { IIIFCanvasAnnotationCard } from './IIIFCanvasAnnotationCard';

interface IIIFMetadataListProps {

  annotations?: Annotation[];
  
  metadata: CozyMetadata[];

  emptyMessage?: string;

}

export const IIIFMetadataList = (props: IIIFMetadataListProps) => {

  const { annotations, metadata } = props;

  const isEmpty = ((annotations || []).length + props.metadata.length) === 0;

  return isEmpty ? (
    <div className="flex items-center justify-center h-full min-h-16 text-muted-foreground text-sm">
      {props.emptyMessage || 'No IIIF Metadata'}
    </div>
  ) : (
    <div>
      {metadata.length > 0 && (
        <ul className="h-full space-y-4 text-sm leading-relaxed pt-8 py-4 px-1">
          {metadata.map(({ label, value }, index) => (
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
      )}

      {annotations?.length > 0 && (
        <ul className="space-y-2">
          {annotations.map(annotation => (
            <IIIFCanvasAnnotationCard 
              key={annotation.id}
              annotation={annotation} />
          ))}
        </ul>
      )}
    </div>
  )

}