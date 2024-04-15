import { EntityBadge } from '@/components/EntityBadge';
import { EntityType } from '@/model';
import { Graph } from '../../Types';
import { AnnotatedEntities } from './AnnotatedEntities';
import { Separator } from '@/ui/Separator';
import { Button } from '@/ui/Button';
import { useNavigate } from 'react-router-dom';

interface EntityTypeDetailsProps {

  graph: Graph;

  type: EntityType

}

export const EntityTypeDetails = (props: EntityTypeDetailsProps) => {

  const { type } = props;

  const linkedNodes = props.graph.getLinkedNodes(type.id).filter(n => n.type === 'IMAGE');

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

      <div className="pb-1.5">
        {linkedNodes.map(node => (
          <section 
            key={node.id} 
            className="p-4 border-t">
            <h3 className="text-xs mb-3 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {node.label}
            </h3>

            <AnnotatedEntities 
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
    </aside>
  )
  
}