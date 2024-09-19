import { ImageAnnotation } from '@annotorious/react';
import { 
  createContext, 
  Dispatch, 
  ReactNode, 
  SetStateAction, 
  useCallback, 
  useContext, 
  useEffect, 
  useRef, 
  useState 
} from 'react';

interface RelationEditorRootContextValue {

  source?: ImageAnnotation;

  setSource: Dispatch<SetStateAction<ImageAnnotation>>;

  target?: ImageAnnotation;

  setTarget: Dispatch<SetStateAction<ImageAnnotation>>;

  cancel(): void;

  registerOnCancel(callback: () => void): void;

}

// @ts-ignore
export const RelationEditorRootContext = createContext<RelationEditorRootContextValue>();

export const RelationEditorRoot = (props: { children: ReactNode }) => {

  const [source, setSource] = useState<ImageAnnotation | undefined>();

  const [target, setTarget] = useState<ImageAnnotation | undefined>();

  const onCancelCallbacks = useRef<(() => void)[]>([]);

  const cancel = useCallback(() => {
    setSource(undefined);
    setTarget(undefined);

    onCancelCallbacks.current.forEach(callback => callback());
  }, []);

  const registerOnCancel = useCallback((callback: () => void) => {
    onCancelCallbacks.current = [...onCancelCallbacks.current, callback];
  }, []);

  return (
    <RelationEditorRootContext.Provider value={{  
      source,
      setSource,
      target,
      setTarget,
      cancel,
      registerOnCancel
    }}>
      {props.children}
    </RelationEditorRootContext.Provider> 
  )

}

export const useRelationEditor = (props: { onCancel?(): void } = {}) => {
  const ctx = useContext(RelationEditorRootContext);

  useEffect(() => {
    if (props.onCancel)
      ctx.registerOnCancel(props.onCancel);
  }, [props.onCancel, ctx.registerOnCancel]);

  return ctx;
};
