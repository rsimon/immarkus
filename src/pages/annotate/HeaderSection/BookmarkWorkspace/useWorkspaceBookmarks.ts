import { useCallback, useEffect, useState } from 'react';
import { LoadedImage } from '@/model';

const KEY_BOOKMARKS = 'immarkus:annotate:bookmarks';

export type WorkspaceBookmark = { name: string, images: string[], current?: boolean };

const hasSameValues = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

export const useWorkspaceBookmarks = (images: LoadedImage[]) => {
  const [bookmarks, setBookmarks] = useState<WorkspaceBookmark[]>([]);
  
  useEffect(() => {
    // Load from localStorage and set 'current' flag if applicable
    const str = localStorage.getItem(KEY_BOOKMARKS);
    if (str) {
      const saved: { name: string; images: string[] }[] = JSON.parse(str);
      setBookmarks(saved.map(({ name, images: ids }) => ({ 
        name,
        images: ids, 
        current: hasSameValues(ids, images.map(i => i.id))
      })));
    }
  }, [images]);

  const isCurrentBookmarked = bookmarks.some(w => w.current);

  const bookmarkCurrentWorkspace = useCallback((name: string) => {
    const currentIds = images.map(i => i.id);

    setBookmarks(prev => {
      if (prev.some(w => hasSameValues(w.images, currentIds))) return prev;

      const next: WorkspaceBookmark[] = [
        ...prev, 
        { name, images: currentIds, current: true }
      ];

      localStorage.setItem(
        KEY_BOOKMARKS, 
        JSON.stringify(next.map(w => ({ name: w.name, images: w.images })))
      );

      return next;
    });
  }, [images]);

  const removeCurrentBookmark = useCallback(() => {
    const currentIds = images.map(i => i.id);

    setBookmarks(prev => {
      if (!prev.some(w => hasSameValues(w.images, currentIds))) return prev;

      const next = prev.filter(w => !hasSameValues(w.images, currentIds));

      localStorage.setItem(
        KEY_BOOKMARKS, 
        JSON.stringify(next.map(w => ({ name: w.name, images: w.images })))
      );

      return next;
    });
  }, [images]);

  return { bookmarks, isCurrentBookmarked, bookmarkCurrentWorkspace, removeCurrentBookmark };

}