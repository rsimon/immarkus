import { EntityType } from '@/model';

export const modernize = (types: EntityType[]): EntityType[] => {
  
  /**
   * Change from 23.01.2024: 
   * 
   * ExternalAuthorityPropertyDefinitions no longer record
   * full external authority data, only the name. This way,
   * changes to the config are effective immediately, not only
   * when (re-)creating the definition.
   */
  let modernized = types.map(e => {
    if ((e.properties || []).find(p => p.type === 'external_authority')) {
      return {
        ...e,
        properties: e.properties.map(p => p.type === 'external_authority'
          // @ts-ignore
          ? { ...p, authorities: p.authorities.map(a => 'name' in a ? a.name : a) }
          : p)
      } as EntityType;
    } else {
      // This entity doesn't contain an external authority property - don't change
      return e;
    }
  });

  console.log('modernized to ', modernized);

  return modernized;

}