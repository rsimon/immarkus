import { EntityType } from '@/model';

/**
 * Change from 23.01.2024: 
 * 
 * ExternalAuthorityPropertyDefinitions no longer record
 * full external authority data, only the name. This way,
 * changes to the config are effective immediately, not only
 * when (re-)creating the definition.
 */
const repairLegacyAuthorityDefinitions = (types: EntityType[]): EntityType[] => 
  types.map(e => {
    if ((e.properties || []).find(p => p.type === 'external_authority')) {
      return {
        ...e,
        properties: e.properties.map(p => p.type === 'external_authority'
          ? { 
              ...p, 
              // @ts-ignore
              authorities: p.authorities.map(a => typeof a === 'string' ? a : a?.name).filter(Boolean)
            }
          : p)
      } as EntityType;
    } else {
      // This entity doesn't contain an external authority property - don't change
      return e;
    }
  });

/**
 * Basic data model integrity: Entity Classes whose `parentId` field
 * points to a non-existing type are turned into root classes.
 */
export const removeMissingParentIds = (types: EntityType[]): EntityType[] => {
  const ids = new Set(types.map(t => t.id));

  return types.map(t => !t.parentId || ids.has(t.parentId) ? t : {
    ...t,
    parentId: undefined
  });
}

export const removeInheritedProps = (types: EntityType[]): EntityType[] => types.map(type => ({
  ...type,
  properties: type.properties 
    ? type.properties.filter(p => !p.inheritedFrom) 
    : undefined
}));

export const repairDataModel = (types: EntityType[]): EntityType[] => {
  let modernized = repairLegacyAuthorityDefinitions(types);

  modernized = removeMissingParentIds(modernized);
  modernized = removeInheritedProps(modernized);
  
  return modernized;
}