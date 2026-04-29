import { useCallback, useEffect, useState } from 'react';
import { LoadedImage } from '@/model';

const KEY_BOOKMARKS = 'immarkus:annotate:bookmarks';

type SavedWorkspace = { name: string, images: string[], current?: boolean };

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
      const saved: { name: string; images: string[] }[] = JSON.parse(str);
      setSavedWorkspaces(saved.map(({ name, images: ids }) => ({ 
        name,
        images: ids, 
        current: hasSameValues(ids, images.map(i => i.id))
      })));
    }
  }, [images]);

  const isCurrentSaved = savedWorkspaces.some(w => w.current);

  const saveCurrentWorkspace = useCallback((name: string) => {
    const currentIds = images.map(i => i.id);

    setSavedWorkspaces(current => {
      if (current.some(w => hasSameValues(w.images, currentIds))) return current;

      const next: SavedWorkspace[] = [
        ...current, 
        { name, images: currentIds, current: true }
      ];

      localStorage.setItem(KEY_BOOKMARKS, JSON.stringify(next.map(w => ({ name: w.name, images: w.images }))));

      return next;
    });
  }, [images]);

  return { savedWorkspaces, isCurrentSaved, saveCurrentWorkspace };

}