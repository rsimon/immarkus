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

  initialViewports: Record<string, ImageViewport>;

  setInitialViewports: Dispatch<SetStateAction<Record<string, ImageViewport>>>;

  initialLayout?: WorkspaceLayout;

  setInitialLayout: Dispatch<SetStateAction<WorkspaceLayout | undefined>>;

  currentLayout?: WorkspaceLayout;

  setCurrentLayout: Dispatch<SetStateAction<WorkspaceLayout | undefined>>;

}

const AnnotationViewStateContext = createContext<AnnotationViewStateContextValue>(undefined);

export const AnnotationViewStateProvider = (props: { children: ReactNode }) => {

  const [imageIds, setImageIds] = useState<string[]>([]);

  const [initialViewports, setInitialViewports] = useState<Record<string, ImageViewport>>({});

  const [initialLayout, setInitialLayout] = useState<WorkspaceLayout>();

  const [currentLayout, setCurrentLayout] = useState<WorkspaceLayout>();

  return (
    <AnnotationViewStateContext.Provider
      value={{
        imageIds,
        setImageIds,
        initialViewports,
        setInitialViewports,
        initialLayout,
        setInitialLayout,
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
    initialViewports,
    setInitialViewports,
    initialLayout,
    setInitialLayout,
    currentLayout,
    setCurrentLayout
  } = useContext(AnnotationViewStateContext);

  const addImageToView = useCallback((imageId: string) => setImageIds(current => {
    if (current.includes(imageId)) return current;
    return [...current, imageId];
  }), []);

  const clearInitialViewport = useCallback((imageId: string) => setInitialViewports(current => {
    if (!(imageId in current)) return current;
    const next = { ...current };
    delete next[imageId];
    return next;
  }), [setInitialViewports]);

  const clearInitialLayout = useCallback(() => setInitialLayout(undefined), [setInitialLayout]);

  return {
    imageIds,
    setImageIds,
    addImageToView,
    initialViewports,
    setInitialViewports,
    clearInitialViewport,
    initialLayout,
    setInitialLayout,
    clearInitialLayout,
    currentLayout,
    setCurrentLayout
  };
}

export const useOpenInAnnotationView = () => {
  const navigate = useNavigate();
  
  const { imageIds, setImageIds, setInitialViewports, setInitialLayout } = useContext(AnnotationViewStateContext);

  const openInAnnotationView = useCallback((
    imageIdOrIds: string | string[],
    viewports?: Record<string, ImageViewport>,
    layout?: WorkspaceLayout
  ) => {
    const ids = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];
    setInitialViewports(viewports || {});
    setInitialLayout(layout);
    setImageIds(ids);

    requestAnimationFrame(() => {
      navigate(`/annotate/${ids.join('&')}`);
    });
  }, [setImageIds, setInitialViewports, setInitialLayout, navigate]);

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