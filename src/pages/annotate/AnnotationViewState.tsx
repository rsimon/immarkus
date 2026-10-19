import { useNavigate } from 'react-router-dom';
import type { ImageViewport, WorkspaceLayout } from '@/store';
import { 
  createContext, 
  type Dispatch, 
  type ReactNode, 
  type SetStateAction, 
  useCallback, 
  useContext, 
  useState 
} from 'react';

interface AnnotationViewStateContextValue {

  imageIds: string[];

  setImageIds: Dispatch<SetStateAction<string[]>>;

  currentViewports: Record<string, ImageViewport>;

  setCurrentViewports: Dispatch<SetStateAction<Record<string, ImageViewport>>>;

  currentLayout?: WorkspaceLayout;

  setCurrentLayout: Dispatch<SetStateAction<WorkspaceLayout | undefined>>;

}

const AnnotationViewStateContext = createContext<AnnotationViewStateContextValue>(undefined);

export const AnnotationViewStateProvider = (props: { children: ReactNode }) => {

  const [imageIds, setImageIds] = useState<string[]>([]);

  const [currentViewports, setCurrentViewports] = useState<Record<string, ImageViewport>>({});

  const [currentLayout, setCurrentLayout] = useState<WorkspaceLayout>();

  return (
    <AnnotationViewStateContext.Provider
      value={{
        imageIds,
        setImageIds,
        currentViewports,
        setCurrentViewports,
        currentLayout,
        setCurrentLayout
      }}>
      {props.children}
    </AnnotationViewStateContext.Provider>
  )

}

export const useAnnotationViewState = () => {
  const {
    imageIds,
    setImageIds,
    currentViewports,
    setCurrentViewports,
    currentLayout,
    setCurrentLayout
  } = useContext(AnnotationViewStateContext);

  const addImageToView = useCallback((imageId: string) => setImageIds(current => {
    if (current.includes(imageId)) return current;
    return [...current, imageId];
  }), []);

  const setCurrentViewport = useCallback((imageId: string, viewport: ImageViewport) =>
    setCurrentViewports(current => {
      const existing = current[imageId];
      if (existing &&
        existing.center.x === viewport.center.x &&
        existing.center.y === viewport.center.y &&
        existing.zoom === viewport.zoom &&
        existing.rotation === viewport.rotation &&
        existing.flip === viewport.flip)
        return current;

      return { ...current, [imageId]: viewport };
    }), [setCurrentViewports]);

  return {
    imageIds,
    setImageIds,
    addImageToView,
    currentViewports,
    setCurrentViewports,
    setCurrentViewport,
    currentLayout,
    setCurrentLayout
  };
}

export const useOpenInAnnotationView = () => {
  const navigate = useNavigate();
  
  const {
    imageIds,
    setImageIds,
    setCurrentViewports,
    setCurrentLayout
  } = useContext(AnnotationViewStateContext);

  const openInAnnotationView = useCallback((
    imageIdOrIds: string | string[],
    viewports?: Record<string, ImageViewport>,
    layout?: WorkspaceLayout
  ) => {
    const ids = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];
    setCurrentViewports(viewports || {});
    setCurrentLayout(layout);
    setImageIds(ids);

    requestAnimationFrame(() => {
      navigate(`/annotate/${ids.join('&')}`);
    });
  }, [setImageIds, setCurrentLayout, setCurrentViewports, navigate]);

  const addToAnnotationView = useCallback((imageIdOrIds: string | string[], open = false) => {
    const ids = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];

    setImageIds(prev => {
      const next = [...new Set([...prev, ...ids])];

      if (open) {
        requestAnimationFrame(() => {
          navigate(`/annotate/${next.join('&')}`);
        });
      }

      return next;
    });
  }, [setImageIds, navigate]);

  return { imageIds, openInAnnotationView, addToAnnotationView };

}