import { useMemo } from 'react';
import { W3CAnnotationBody } from '@annotorious/react';
import { EntityType } from '@/model';
import { RelatedAnnotation, useRelationGraph } from '@/store';
import { Separator } from '@/ui/Separator';
import { InboundRelationCard } from './InboundRelationCard';

interface InboundRelationsProps {

  schemaBodies: { body: W3CAnnotationBody, entityType: EntityType }[];

}

export const InboundRelations = (props: InboundRelationsProps) => {

  const graph = useRelationGraph();

  const related = useMemo(() => {
    if (!graph) return [];

    return props.schemaBodies.reduce<RelatedAnnotation[]>((all, { body, entityType }) => {
      const related = graph.getInboundLinks(entityType.id, (body as any).properties || {});
      return [...all, ...related];
    }, []);
  }, [graph, props.schemaBodies]);

  return related.length > 0 && (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 py-4 items-center">
        <span>Related</span>
      </h3>

      <div className="mb-4">
        <ul>
          {related.map(r => (
            <li key={r.annotationId} className="mb-5 relative">
              <InboundRelationCard related={r} />
            </li>
          ))}
        </ul>
      </div>

      <Separator />
    </div>
  )

}