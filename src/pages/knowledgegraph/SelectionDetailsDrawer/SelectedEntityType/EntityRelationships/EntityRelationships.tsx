import { useCallback } from 'react';
import { EntityType } from '@/model';
import { GraphLinkPrimitive } from '../../../Types';
import { EntityRelationshipCard } from './EntityRelationshipCard';

interface EntityRelationshipsProps {

  selectedType: EntityType;

  relatedTypes: EntityType[];

  relationships: GraphLinkPrimitive[];

}

export const EntityRelationships = (props: EntityRelationshipsProps) => {

  const { relatedTypes, relationships, selectedType } = props;

  const getRelationshipsTo = useCallback((entityId: string) => (
    relationships.filter(p => 
      (p.source === selectedType.id && p.target === entityId) ||
      (p.source === entityId && p.target === selectedType.id))
  ), [selectedType, relationships])

  return (
    <div className="space-y-2">
      {relatedTypes.map(type => (
        <EntityRelationshipCard 
          key={`${selectedType.id}-${type.id}`}
          selectedType={selectedType} 
          relatedType={type} 
          relationships={getRelationshipsTo(type.id)} />
      ))}
    </div>
  );

}