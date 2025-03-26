import { Cuboid } from 'lucide-react';
import { EntityType } from '@/model';
import { EntityRelationshipCardItem } from './EntityRelationshipCardItem';
import { GraphLinkPrimitive } from '../../../Types';

interface EntityRelationshipCardProps {

  selectedType: EntityType;

  relatedType: EntityType;

  relationships: GraphLinkPrimitive[];

}

export const EntityRelationshipCard = (props: EntityRelationshipCardProps) => {

  const { relatedType, relationships } = props;

  return (
    <article className="bg-white border shadow-xs rounded">
      <h3 className="flex gap-1.5 p-2.5 items-center text-xs whitespace-nowrap overflow-hidden">
        <Cuboid className="h-3.5 w-3.5" />
        <span className="overflow-hidden text-ellipsis">
          {relatedType.label || relatedType.id}
        </span>
      </h3>

      <ul>
        {relationships.map((rel, idx) => (
          <li key={`${idx}`}>
            <EntityRelationshipCardItem 
              selectedType={props.selectedType}
              relatedType={props.relatedType} 
              relationship={rel} />
          </li>
        ))}
      </ul>
    </article>
  )

}