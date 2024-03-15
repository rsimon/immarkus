import Fuse from 'fuse.js';
import { useStore } from '@/store';
import { Folder, Image } from '@/model';

export const useSearch = () => {

  const store = useStore();

  const { images, folders } = store;

  const fuse = new Fuse<Folder | Image>([...images, ...folders], { 
    keys: ['name'],
    shouldSort: true,
    threshold: 0.6,
    includeScore: true,
    useExtendedSearch: true
  });

  const search = (query: string, limit?: number): (Folder | Image)[] =>
    fuse.search(query, { limit: limit || 10 })
      .filter(r => r.score < 0.2)
      .map(r => r.item);

  return search;

}