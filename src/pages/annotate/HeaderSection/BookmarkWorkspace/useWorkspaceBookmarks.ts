import { useCallback, useMemo } from 'react';
import { LoadedImage } from '@/model';
import { type WorkspaceBookmark, useSettings } from '@/store';

type LoadedBookmark = WorkspaceBookmark & { current: boolean };

const hasSameValues = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

export const useWorkspaceBookmarks = (images: LoadedImage[]) => {
  const { settings, updateSettings } = useSettings();

  const bookmarks: LoadedBookmark[] = useMemo(() => {
    return (settings.bookmarks || []).map(({ name, images: ids }) => ({ 
      name,
      images: ids, 
      current: hasSameValues(ids, images.map(i => i.id))
    }))
  }, [settings, images]);
 
  const isCurrentBookmarked = bookmarks.some(w => w.current);

  const bookmarkCurrentWorkspace = useCallback((name: string) => {
    const currentIds = images.map(i => i.id);

    updateSettings(prev => {
      const prevBookmarks = prev.bookmarks || [];
      if (prevBookmarks.some(w => hasSameValues(w.images, currentIds))) return {};

      const nextBookmarks: WorkspaceBookmark[] = [
        ...prevBookmarks, 
        { name, images: currentIds }
      ];

      return { bookmarks: nextBookmarks };
    });
  }, [images]);

  const removeCurrentBookmark = useCallback(() => {
    const currentIds = images.map(i => i.id);

    updateSettings(prev => {
      const prevBookmarks = prev.bookmarks || [];
      if (!prevBookmarks.some(w => hasSameValues(w.images, currentIds))) return {};

      const nextBookmarks = prevBookmarks.filter(w => !hasSameValues(w.images, currentIds));
      return { bookmarks: nextBookmarks };
    });
  }, [images]);

  return { bookmarks, isCurrentBookmarked, bookmarkCurrentWorkspace, removeCurrentBookmark };

}