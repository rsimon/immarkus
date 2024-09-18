import { ImageAnnotation } from '@annotorious/react';
import { 
  createContext, 
  Dispatch, 
  ReactNode, 
  SetStateAction, 
  useContext, 
  useState 
} from 'react';

interface RelationEditorRootContextValue {

  source?: ImageAnnotation;

  setSource: Dispatch<SetStateAction<ImageAnnotation>>;

  target?: ImageAnnotation;

  setTarget: Dispatch<SetStateAction<ImageAnnotation>>;

}

// @ts-ignore
export const RelationEditorRootContext = createContext<RelationEditorRootContextValue>();

export const RelationEditorRoot = (props: { children: ReactNode }) => {

  const [source, setSource] = useState<ImageAnnotation | undefined>();

  const [target, setTarget] = useState<ImageAnnotation | undefined>();

  return (
    <RelationEditorRootContext.Provider value={{  
      source,
      setSource,
      target,
      setTarget
    }}>
      {props.children}
    </RelationEditorRootContext.Provider> 
  )

}

export const useRelationEditor = () => useContext(RelationEditorRootContext);
