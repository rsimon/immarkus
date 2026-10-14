import { useCallback, useMemo } from 'react';
import { LoadedImage } from '@/model';
import { type WorkspaceBookmark, useSettings } from '@/store';
import { useWorkspaceViewportState } from '../../WorkspaceSection/WorkspaceViewportState';

type LoadedBookmark = WorkspaceBookmark & { current: boolean };

const hasSameValues = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

export const useWorkspaceBookmarks = (images: LoadedImage[]) => {
  const { settings, updateSettings } = useSettings();

  const { captureViewports } = useWorkspaceViewportState();

  const bookmarks: LoadedBookmark[] = useMemo(() => {
    return (settings.bookmarks || []).map(bookmark => ({
      ...bookmark,
      current: hasSameValues(bookmark.images, images.map(i => i.id))
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [settings, images]);
 
  const isCurrentBookmarked = bookmarks.some(w => w.current);

  const createBookmark = useCallback((name: string) => {
    const currentIds = images.map(i => i.id);
    const viewports = captureViewports(currentIds);

    updateSettings(prev => {
      const prevBookmarks = prev.bookmarks || [];
      if (prevBookmarks.some(w => hasSameValues(w.images, currentIds))) return {};

      const nextBookmarks: WorkspaceBookmark[] = [
        ...prevBookmarks, 
        { name, images: currentIds, viewports }
      ];

      return { 
        ...prev,
        bookmarks: nextBookmarks 
      };
    });
  }, [captureViewports, images]);

  const updateBookmark = useCallback((bookmark: WorkspaceBookmark) => {
    const currentIds = images.map(i => i.id);
    const viewports = captureViewports(currentIds);

    updateSettings(prev => {
      const nextBookmarks = (prev.bookmarks || []).map(b => b.name === bookmark.name ? {
        name: b.name,
        images: currentIds,
        viewports
      } : b); 

      return { 
        ...prev,
        bookmarks: nextBookmarks
      }
    });
  }, [captureViewports, images]);

  const removeCurrentBookmark = useCallback(() => {
    const currentIds = images.map(i => i.id);

    updateSettings(prev => {
      const prevBookmarks = prev.bookmarks || [];
      if (!prevBookmarks.some(w => hasSameValues(w.images, currentIds))) return {};

      const nextBookmarks = prevBookmarks.filter(w => !hasSameValues(w.images, currentIds));
      return { bookmarks: nextBookmarks };
    });
  }, [images]);

  return { bookmarks, isCurrentBookmarked, createBookmark, updateBookmark, removeCurrentBookmark };

}