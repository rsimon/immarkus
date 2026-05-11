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