import { useNavigate } from 'react-router-dom';
import type { ImageViewport } from '@/store';
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

}

const AnnotationViewStateContext = createContext<AnnotationViewStateContextValue>(undefined);

export const AnnotationViewStateProvider = (props: { children: ReactNode }) => {

  const [imageIds, setImageIds] = useState<string[]>([]);

  const [initialViewports, setInitialViewports] = useState<Record<string, ImageViewport>>({});

  return (
    <AnnotationViewStateContext.Provider
      value={{ imageIds, setImageIds, initialViewports, setInitialViewports }}>
      {props.children}
    </AnnotationViewStateContext.Provider>
  )

}

export const useAnnotationViewState = () => {
  const { imageIds, setImageIds, initialViewports, setInitialViewports } = useContext(AnnotationViewStateContext);

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

  return { imageIds, setImageIds, addImageToView, initialViewports, setInitialViewports, clearInitialViewport };
}

export const useOpenInAnnotationView = () => {
  const navigate = useNavigate();
  
  const { imageIds, setImageIds, setInitialViewports } = useContext(AnnotationViewStateContext);

  const openInAnnotationView = useCallback((
    imageIdOrIds: string | string[],
    viewports?: Record<string, ImageViewport>
  ) => {
    const ids = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];
    setInitialViewports(viewports || {});
    setImageIds(ids);

    requestAnimationFrame(() => {
      navigate(`/annotate/${ids.join('&')}`);
    });
  }, [setImageIds, setInitialViewports, navigate]);

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