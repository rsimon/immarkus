import { EntityBadge } from '@/components/EntityBadge';
import { EntityType } from '@/model';
import { Graph } from '../../Types';
import { AnnotatedEntities } from './AnnotatedEntities';

interface EntityTypeDetailsProps {

  graph: Graph;

  type: EntityType

}

export const EntityTypeDetails = (props: EntityTypeDetailsProps) => {

  const { type } = props;

  const linkedNodes = props.graph.getLinkedNodes(type.id);

  return (
    <aside className="p-4">
      <div>
        <h2><EntityBadge entityType={type} /></h2>
        <p className="px-0.5 py-2 text-sm text-muted-foreground">{type.description}</p>
      </div>

      <div>
        {linkedNodes.map(node => (
          <AnnotatedEntities 
            key={node.id}
            imageId={node.id} 
            entityType={type} />
        ))}
      </div>
    </aside>
  )
  
}