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

  samPluginError?: any;

  setSamPlugin: Dispatch<SetStateAction<ReturnType<typeof mountOpenSeadragonPlugin>>>;

}

// @ts-expect-error
export const SmartSelectionContext = createContext<SmartSelectionContextValue>();

export const SmartSelectionRoot = (props: { children: ReactNode }) => {

  const [samPlugin, setSamPlugin] = useState<ReturnType<typeof mountOpenSeadragonPlugin>>();

  const [samPluginBusy, setSamPluginBusy] = useState(true);

  const [samPluginError, setSamPluginError] = useState<any | undefined>();

  useEffect(() => {
    if (!samPlugin) return;

    const removeInitHandler = samPlugin.on('initialized', () => setSamPluginBusy(false));
    const removeInitErrorHander = samPlugin.on('initError', error => setSamPluginError(error));
    const removeStartAnimationHandler = samPlugin.on('animationStart', () => setSamPluginBusy(true));
    const removeStartEncodingHandler = samPlugin.on('encodingStart', () => setSamPluginBusy(true));
    const removeEncodingCompleteHanlder = samPlugin.on('encodingFinished', () => setSamPluginBusy(false));

    return () => {
      removeInitHandler();
      removeInitErrorHander();
      removeStartAnimationHandler();
      removeStartEncodingHandler();
      removeEncodingCompleteHanlder();
    }
  }, [samPlugin]);

  return (
    <SmartSelectionContext.Provider value={{  
      samPlugin,
      samPluginBusy,
      samPluginError,
      setSamPlugin
    }}>
      {props.children}
    </SmartSelectionContext.Provider> 
  )

}

export const useSAMPlugin = () => {
  const { samPlugin, samPluginBusy, samPluginError } = useContext(SmartSelectionContext);
  return { samPlugin, samPluginBusy, samPluginError };
}
