import { useNavigate } from 'react-router-dom';
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

}

const AnnotationViewStateContext = createContext<AnnotationViewStateContextValue>(undefined);

export const AnnotationViewStateProvider = (props: { children: ReactNode }) => {

  const [imageIds, setImageIds] = useState<string[]>([]);

  return (
    <AnnotationViewStateContext.Provider
      value={{ imageIds, setImageIds }}>
      {props.children}
    </AnnotationViewStateContext.Provider>
  )

}

export const useAnnotationViewState = () => {
  const { imageIds, setImageIds } = useContext(AnnotationViewStateContext);

  const addImageToView = useCallback((imageId: string) => setImageIds(current => {
    if (current.includes(imageId)) return current;
    return [...current, imageId];
  }), []);

  return { imageIds, setImageIds, addImageToView };
}

export const useOpenInAnnotationView = () => {
  const navigate = useNavigate();
  
  const { imageIds, setImageIds } = useContext(AnnotationViewStateContext);

  const openInAnnotationView = useCallback((imageIdOrIds: string | string[]) => {
    const ids = Array.isArray(imageIdOrIds) ? imageIdOrIds : [imageIdOrIds];
    setImageIds(ids);

    requestAnimationFrame(() => {
      navigate(`/annotate/${ids.join('&')}`);
    });
  }, [setImageIds, navigate]);

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