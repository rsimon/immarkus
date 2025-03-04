import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { mountOpenSeadragonPlugin } from '@annotorious/plugin-segment-anything/openseadragon';

interface SmartSelectionContextValue {

  samPlugin: ReturnType<typeof mountOpenSeadragonPlugin>;

  setSamPlugin: Dispatch<SetStateAction<ReturnType<typeof mountOpenSeadragonPlugin>>>;

}

// @ts-expect-error
export const SmartSelectionContext = createContext<SmartSelectionContextValue>();

export const SmartSelectionRoot = (props: { children: ReactNode }) => {

  const [samPlugin, setSamPlugin] = useState<ReturnType<typeof mountOpenSeadragonPlugin>>();

  return (
    <SmartSelectionContext.Provider value={{  
      samPlugin,
      setSamPlugin
    }}>
      {props.children}
    </SmartSelectionContext.Provider> 
  )

}

export const useSAMPlugin = () => {
  const { samPlugin } = useContext(SmartSelectionContext);
  return samPlugin;
}
