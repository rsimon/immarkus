import { EntityBadge } from '@/components/EntityBadge';
import { EntityType } from '@/model';
import { Graph } from '../Types';

interface EntityTypeDetailsProps {

  graph: Graph;

  type: EntityType

}

export const EntityTypeDetails = (props: EntityTypeDetailsProps) => {

  const { type } = props;

  const linkedNodes = props.graph.getLinkedNodes(type.id);
  
  console.log(linkedNodes);

  return (
    <aside className="p-4">
      <h2><EntityBadge entityType={type} /></h2>
      <p>{type.description}</p>
    </aside>
  )
  
}