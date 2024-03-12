import { EntityBadge } from '@/components/EntityBadge';
import { EntityType } from '@/model';

interface EntityTypeDetailsProps {

  type: EntityType

}

export const EntityTypeDetails = (props: EntityTypeDetailsProps) => {

  const { type } = props;

  return (
    <aside>
      <h2><EntityBadge entityType={type} /></h2>
      <p>{type.description}</p>
    </aside>
  )
  
}