import { mountOpenSeadragonPlugin } from '@annotorious/plugin-segment-anything/openseadragon';
import { 
  Dispatch, 
  ReactNode, 
  SetStateAction, 
  createContext, 
  useContext, 
  useEffect, 
  useState 
} from 'react';

interface SmartSelectionContextValue {

  samPlugin: ReturnType<typeof mountOpenSeadragonPlugin>;

  samPluginBusy: boolean;

  setSamPlugin: Dispatch<SetStateAction<ReturnType<typeof mountOpenSeadragonPlugin>>>;

}

// @ts-expect-error
export const SmartSelectionContext = createContext<SmartSelectionContextValue>();

export const SmartSelectionRoot = (props: { children: ReactNode }) => {

  const [samPlugin, setSamPlugin] = useState<ReturnType<typeof mountOpenSeadragonPlugin>>();

  const [samPluginBusy, setSamPluginBusy] = useState(true);

  useEffect(() => {
    if (!samPlugin) return;

    const removeInitHandler = samPlugin.on('initialized', () => setSamPluginBusy(false));
    const removeStartAnimationHandler = samPlugin.on('animationStart', () => setSamPluginBusy(true));
    const removeStartEncodingHandler = samPlugin.on('encodingStart', () => setSamPluginBusy(true));
    const removeEncodingCompleteHanlder = samPlugin.on('encodingFinished', () => setSamPluginBusy(false));

    return () => {
      removeInitHandler();
      removeStartAnimationHandler();
      removeStartEncodingHandler();
      removeEncodingCompleteHanlder();
    }
  }, [samPlugin]);

  return (
    <SmartSelectionContext.Provider value={{  
      samPlugin,
      samPluginBusy,
      setSamPlugin
    }}>
      {props.children}
    </SmartSelectionContext.Provider> 
  )

}

export const useSAMPlugin = () => {
  const { samPlugin, samPluginBusy } = useContext(SmartSelectionContext);
  return { samPlugin, samPluginBusy };
}
