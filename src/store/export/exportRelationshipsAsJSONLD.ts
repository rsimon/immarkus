import { Store } from '@/store';

export const exportRelationshipsAsJSONLD = (store: Store) => {
  const relationships = store.listAllRelations();

  const str = JSON.stringify(relationships);
  const data = new TextEncoder().encode(str);
  const blob = new Blob([data], {
    type: 'application/json;charset=utf-8'
  });

  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'annotations.json';
  anchor.click();
}