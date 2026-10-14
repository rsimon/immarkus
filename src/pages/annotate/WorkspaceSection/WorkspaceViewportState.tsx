import { createContext, type ReactNode, useCallback, useContext, useRef } from 'react';
import OpenSeadragon from 'openseadragon';
import { useViewers } from '@annotorious/react-manifold';
import type { ImageViewport } from '@/store';

interface WorkspaceViewportStateValue {

  registerViewer(imageId: string, viewerId: string): () => void;

  captureViewports(imageIds: string[]): Record<string, ImageViewport>;

}

const WorkspaceViewportStateContext = createContext<WorkspaceViewportStateValue | undefined>(undefined);

export const WorkspaceViewportStateProvider = (props: { children: ReactNode }) => {

  const viewers = useViewers();

  const viewerImageIds = useRef<Map<string, string>>(new Map());

  const registerViewer = useCallback((imageId: string, viewerId: string) => {
    viewerImageIds.current.set(viewerId, imageId);

    return () => {
      if (viewerImageIds.current.get(viewerId) === imageId)
        viewerImageIds.current.delete(viewerId);
    }
  }, []);

  const captureViewports = useCallback((imageIds: string[]) => {
    const viewports: Record<string, ImageViewport> = {};

    imageIds.forEach(imageId => {
      const viewerId = Array.from(viewerImageIds.current)
        .find(([, registeredImageId]) => registeredImageId === imageId)?.[0] || imageId;
      const viewer = viewers?.get(viewerId);
      if (!viewer?.isOpen()) return;

      const center = viewer.viewport.getCenter(true);

      viewports[imageId] = {
        center: { x: center.x, y: center.y },
        zoom: viewer.viewport.getZoom(true)
      };
    });

    return viewports;
  }, [viewers]);

  return (
    <WorkspaceViewportStateContext.Provider
      value={{ registerViewer, captureViewports }}>
      {props.children}
    </WorkspaceViewportStateContext.Provider>
  )

}

export const useWorkspaceViewportState = () => {

  const state = useContext(WorkspaceViewportStateContext);
  if (!state) throw new Error('useWorkspaceViewportState must be used within WorkspaceViewportStateProvider');

  return state;

}

export const restoreImageViewport = (
  viewer: OpenSeadragon.Viewer,
  viewport: ImageViewport
) => {
  viewer.viewport.zoomTo(viewport.zoom, undefined, true);
  viewer.viewport.panTo(new OpenSeadragon.Point(viewport.center.x, viewport.center.y), true);
  viewer.viewport.applyConstraints();
}
