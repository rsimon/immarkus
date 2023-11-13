import { ReactNode, createContext, useContext, useState } from 'react';
import { Viewer } from '@annotorious/react';

interface OSDViewerContextValue {

  viewers: Viewer[]

  setViewers: React.Dispatch<React.SetStateAction<Viewer[]>>

}

export const OSDViewerContext = createContext<OSDViewerContextValue>({

  viewers: undefined,

  setViewers: undefined,

});

export const OSDViewerManifold = (props: { children: ReactNode }) => {

  const [viewers, setViewers] = useState<Viewer[]>([]);

  console.log('manifold!', viewers);

  return (
    <OSDViewerContext.Provider value={{ viewers, setViewers }}>
      {props.children}
    </OSDViewerContext.Provider>
  )

}

export const useViewers = () => {
  const { viewers } = useContext(OSDViewerContext);
  return viewers;
}