import { EntityType } from '@/model';
import { Graph } from '../../../Types';
import { RelatedEntityCard } from './RelatedEntityCard';

interface EntityRelationshipsProps {

  graph: Graph;

  type: EntityType;

  related: EntityType[];

}

export const EntityRelationships = (props: EntityRelationshipsProps) => {

  return (
    <div>
      {props.related.map(related => (
        <RelatedEntityCard 
          reference={props.type}
          related={related} />
      ))}
    </div>
  );

}