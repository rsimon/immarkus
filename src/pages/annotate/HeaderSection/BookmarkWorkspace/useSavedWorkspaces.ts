import { useCallback, useEffect, useState } from 'react';
import { LoadedImage } from '@/model';

const KEY_BOOKMARKS = 'immarkus:annotate:bookmarks';

type SavedWorkspace = { images: string[], current?: boolean };

const hasSameValues = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

export const useSavedWorkspaces = (images: LoadedImage[]) => {
  const [savedWorkspaces, setSavedWorkspaces] = useState<SavedWorkspace[]>([]);
  
  useEffect(() => {
    // Load from localStorage and set 'current' flag if applicable
    const str = localStorage.getItem(KEY_BOOKMARKS);
    if (str) {
      const saved: string[][] = JSON.parse(str);
      setSavedWorkspaces(saved.map(ids => ({ 
        images: ids, 
        current: hasSameValues(ids, images.map(i => i.id))
      })));
    }
  }, [images]);

  const isCurrentSaved = savedWorkspaces.some(w => w.current);

  const saveCurrentWorkspace = useCallback(() => {
    const currentIds = images.map(i => i.id);

    setSavedWorkspaces(current => {
      if (current.some(w => hasSameValues(w.images, currentIds))) return current;

      const next: SavedWorkspace[] = [
        ...current, 
        { images: currentIds, current: true }
      ];

      localStorage.setItem(KEY_BOOKMARKS, JSON.stringify(next.map(w => w.images)));

      return next;
    });
  }, [images]);

  return { savedWorkspaces, isCurrentSaved, saveCurrentWorkspace };

}