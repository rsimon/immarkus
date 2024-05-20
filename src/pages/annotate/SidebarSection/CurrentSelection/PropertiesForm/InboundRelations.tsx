import { W3CAnnotationBody } from '@annotorious/react';
import { Spline } from 'lucide-react';
import { EntityType } from '@/model';
import { RelatedAnnotation, useRelationGraph } from '@/store';
import { Separator } from '@/ui/Separator';
import { useEffect, useMemo } from 'react';

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

  return graph && (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 py-4 items-center">
        <Spline className="h-4 w-4" /> 
        <span>Inbound Relations</span>
      </h3>

      <div>
        <ul>
          {related.map(r => (
            <li key={r.annotationId}>
              {r.sourceEntityType}
            </li>
          ))}
        </ul>
      </div>

      <Separator />
    </div>
  )

}