import { useMemo } from 'react';
import { ImageAnnotation, W3CAnnotation } from '@annotorious/react';
import { useRuntimeConfig } from '@/RuntimeConfig';
import { AnnotationsTabItem } from './AnnotationsTabItem';
import { RelationGraph } from '@/store';
import { InboundRelationCard } from '@/components/InboundRelations/InboundRelationCard';
import { Spline } from 'lucide-react';

interface AnnotationsTabProps {

  annotations: W3CAnnotation[];

  relations: RelationGraph;

}

export const AnnotationsTab = (props: AnnotationsTabProps) => {

  const { authorities } = useRuntimeConfig();

  const { annotations } = props;

  const inboundRelations = useMemo(() => {
    if (!annotations) return [];

    return annotations.map(annotation => ({
      annotation,
      related: props.relations.getInboundLinks(annotation)
    }));
  }, [annotations]);

  return (
    <div>
      <ul className="pt-2 px-2">
        {props.annotations.map(annotation => (
          <li key={annotation.id}>
            <AnnotationsTabItem 
              key={annotation.id}
              annotation={annotation}
              authorities={authorities} />
          </li>
        ))}
      </ul>

      {inboundRelations.length > 0 && (
        <>
          <h2 className="p-4 flex items-center text-sm font-semibold">
            <Spline className="w-4 h-4 mr-1.5" /> Related
          </h2>
          <ul className="px-2">
            {inboundRelations.map(({ annotation, related }, idx) => related.map(r => (
              <li 
                key={`${annotation.id}-${idx}`}
                className="mb-2">
                <InboundRelationCard
                  annotation={annotation as unknown as ImageAnnotation}
                  related={r} />
              </li>
            )))}
          </ul>
        </>
      )}
    </div>
  )

}