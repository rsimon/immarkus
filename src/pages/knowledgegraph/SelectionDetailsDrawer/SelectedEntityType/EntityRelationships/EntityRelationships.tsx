import { useCallback, useMemo } from 'react';
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

  const sorted = useMemo(() => {
    const getRelationshipsTo = (entityId: string) =>
      relationships.filter(p => 
        (p.source === selectedType.id && p.target === entityId) ||
        (p.source === entityId && p.target === selectedType.id));

    return [...relatedTypes]
      .sort((a, b) => ((a.label || a.id).localeCompare(b.label || b.id)))
      .map(type => ({ type, relationships: getRelationshipsTo(type.id) }))
      // Problem: if there's a relationship between two entities (this and 
      // another), both will be included in the relatedTypes list. But there
      // will be only one relationship! This would leave the other entity "empty".
      .filter(({ relationships }) => relationships.length > 0);
  }, [relatedTypes]);

  return (
    <div className="space-y-2">
      {sorted.map(({ type, relationships }) => (
        <EntityRelationshipCard 
          key={`${selectedType.id}-${type.id}`}
          selectedType={selectedType} 
          relatedType={type} 
          relationships={relationships} />
      ))}
    </div>
  );

}