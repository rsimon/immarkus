import { useCallback, useMemo } from 'react';
import { useViewers } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { type ImageViewport, type WorkspaceBookmark, useSettings } from '@/store';
import { useAnnotationViewState } from '../../AnnotationViewState';

type LoadedBookmark = WorkspaceBookmark & { current: boolean };

const hasSameValues = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

export const useWorkspaceBookmarks = (images: LoadedImage[]) => {
  const { settings, updateSettings } = useSettings();

  const { currentLayout } = useAnnotationViewState();

  const viewers = useViewers();

  const captureViewports = useCallback((imageIds: string[]) => {
    const viewports: Record<string, ImageViewport> = {};

    imageIds.forEach(imageId => {
      const viewer = viewers.get(imageId);
      if (!viewer?.isOpen()) return;

      const center = viewer.viewport.getCenter(true);
      viewports[imageId] = {
        center: { x: center.x, y: center.y },
        zoom: viewer.viewport.getZoom(true)
      };
    });

    return viewports;
  }, [viewers]);

  const bookmarks: LoadedBookmark[] = useMemo(() => {
    return (settings.bookmarks || []).map(bookmark => ({
      ...bookmark,
      current: hasSameValues(bookmark.images, images.map(i => i.id))
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [settings, images]);
 
  const isCurrentBookmarked = bookmarks.some(w => w.current);

  const currentBookmark = bookmarks.find(bookmark => bookmark.current);

  const createBookmark = useCallback((name: string) => {
    const currentIds = images.map(i => i.id);
    const viewports = captureViewports(currentIds);

    return updateSettings(prev => {
      const prevBookmarks = prev.bookmarks || [];
      if (prevBookmarks.some(w => hasSameValues(w.images, currentIds))) return {};

      const nextBookmarks: WorkspaceBookmark[] = [
        ...prevBookmarks, 
        { name, images: currentIds, viewports, layout: currentLayout }
      ];

      return { 
        ...prev,
        bookmarks: nextBookmarks 
      };
    });
  }, [captureViewports, currentLayout, images]);

  const updateBookmark = useCallback((bookmark: WorkspaceBookmark) => {
    const currentIds = images.map(i => i.id);
    const viewports = captureViewports(currentIds);

    return updateSettings(prev => {
      const nextBookmarks = (prev.bookmarks || []).map(b => b.name === bookmark.name ? {
        name: b.name,
        images: currentIds,
        viewports,
        layout: currentLayout
      } : b); 

      return { 
        ...prev,
        bookmarks: nextBookmarks
      }
    });
  }, [captureViewports, currentLayout, images]);

  const removeCurrentBookmark = useCallback(() => {
    const currentIds = images.map(i => i.id);

    updateSettings(prev => {
      const prevBookmarks = prev.bookmarks || [];
      if (!prevBookmarks.some(w => hasSameValues(w.images, currentIds))) return {};

      const nextBookmarks = prevBookmarks.filter(w => !hasSameValues(w.images, currentIds));
      return { bookmarks: nextBookmarks };
    });
  }, [images]);

  return { bookmarks, isCurrentBookmarked, currentBookmark, createBookmark, updateBookmark, removeCurrentBookmark };

}