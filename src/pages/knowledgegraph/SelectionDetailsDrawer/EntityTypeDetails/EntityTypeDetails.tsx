import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityBadge } from '@/components/EntityBadge';
import { EntityType } from '@/model';
import { RelationGraph } from '@/store';
import { Button } from '@/ui/Button';
import { Graph, KnowledgeGraphSettings } from '../../Types';
import { EntityAnnotations } from './EntityAnnotations';
import { Spline } from 'lucide-react';
import { RelatedAnnotationList } from './RelatedAnnotationList';

interface EntityTypeDetailsProps {

  graph: Graph;

  relations: RelationGraph;

  settings: KnowledgeGraphSettings;

  type: EntityType

}

export const EntityTypeDetails = (props: EntityTypeDetailsProps) => {

  const { type } = props;

  const linkedNodes = useMemo(() => (
    props.graph.getLinkedNodes(type.id).filter(n => n.type === 'IMAGE')
  ), [type]);

  const relatedAnnotations = useMemo(() => (
    props.relations.listRelations().filter(r => 
      r.sourceEntityType === type.id || r.targetEntityType === type.id)
  ), [type]);

  const navigate = useNavigate();

  const onOpen = (id: string) => navigate(`/annotate/${id}`);

  return (
    <aside>
      <div className="p-4">
        <h2><EntityBadge entityType={type} /></h2>
        {type.description && (
          <p className="px-0.5 pt-2 text-xs text-muted-foreground">
            {type.description}
          </p>
        )}
      </div>

      {props.settings.graphMode === 'HIERARCHY' && (
        <div className="pb-1.5">
          {linkedNodes.map(node => (
            <section 
              key={node.id} 
              className="p-4 border-t">
              <h3 className="text-xs mb-3 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {node.label}
              </h3>

              <EntityAnnotations 
                key={node.id}
                imageId={node.id} 
                entityType={type} />

              <p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3 text-xs"
                  onClick={() => onOpen(node.id)}>
                  Open Image
                </Button>
              </p>
            </section>
          ))}
        </div>
      )}

      {props.settings.graphMode === 'RELATIONS' && (
        <div className="border-t">
          <h2 className="p-4 flex items-center text-sm font-semibold">
            <Spline className="w-4 h-4 mr-1.5" /> Related
          </h2>

          <RelatedAnnotationList 
            related={relatedAnnotations} />
        </div>
      )}
    </aside>
  )
  
}