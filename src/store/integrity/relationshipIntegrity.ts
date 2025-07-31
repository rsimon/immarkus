import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import type { AnnotationStore } from '../Store';

export const repairRelationships = (
  relationships: (W3CRelationLinkAnnotation | W3CRelationMetaAnnotation)[],
  store: AnnotationStore
): Promise<(W3CRelationLinkAnnotation | W3CRelationMetaAnnotation)[]> => {
  const links = relationships.filter(r => r.motivation === 'linking');

  const promise = links.reduce<Promise<W3CRelationLinkAnnotation[]>>((promise, link) => (
    promise.then(allOrphaned => {
      const s = store.findAnnotation(link.body);
      const t = store.findAnnotation(link.target);

      return Promise.all([s, t]).then(([sa, ta]) => {
        return (!sa || !ta) ? [...allOrphaned, link] : allOrphaned;
      })
    })
  ), Promise.resolve([]));

  return promise.then(orphaned => {
    const orphanedIds = new Set(orphaned.map(l => l.id));

    if (orphanedIds.size > 0)
      console.warn('The following links are orphaned', [...orphanedIds]);
    
    return relationships.filter(a => !orphanedIds.has(a.id) && !orphanedIds.has(a.target));
  });

}
