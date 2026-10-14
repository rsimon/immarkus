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

  pendingViewports: Record<string, ImageViewport>;

  setPendingViewports: Dispatch<SetStateAction<Record<string, ImageViewport>>>;

}

const AnnotationViewStateContext = createContext<AnnotationViewStateContextValue>(undefined);

export const AnnotationViewStateProvider = (props: { children: ReactNode }) => {

  const [imageIds, setImageIds] = useState<string[]>([]);

  const [pendingViewports, setPendingViewports] = useState<Record<string, ImageViewport>>({});

  return (
    <AnnotationViewStateContext.Provider
      value={{ imageIds, setImageIds, pendingViewports, setPendingViewports }}>
      {props.children}
    </AnnotationViewStateContext.Provider>
  )

}

export const useAnnotationViewState = () => {
  const { imageIds, setImageIds, pendingViewports, setPendingViewports } = useContext(AnnotationViewStateContext);

  const addImageToView = useCallback((imageId: string) => setImageIds(current => {
    if (current.includes(imageId)) return current;
    return [...current, imageId];
  }), []);

  const consumeViewport = useCallback((imageId: string) => setPendingViewports(current => {
    if (!(imageId in current)) return current;
    const next = { ...current };
    delete next[imageId];
    return next;
  }), [setPendingViewports]);

  return { imageIds, setImageIds, addImageToView, pendingViewports, setPendingViewports, consumeViewport };
}

export const useOpenInAnnotationView = () => {
  const navigate = useNavigate();
  
  const { imageIds, setImageIds, setPendingViewports } = useContext(AnnotationViewStateContext);

  const openInAnnotationView = useCallback((
    imageIdOrIds: string | string[],
    viewports?: Record<string, ImageViewport>
  ) => {
    const ids = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];
    setPendingViewports(viewports || {});
    setImageIds(ids);

    requestAnimationFrame(() => {
      navigate(`/annotate/${ids.join('&')}`);
    });
  }, [setImageIds, setPendingViewports, navigate]);

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