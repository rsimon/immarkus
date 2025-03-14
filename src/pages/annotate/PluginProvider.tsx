import { mountOpenSeadragonPlugin as mountSAMPlugin } from '@annotorious/plugin-segment-anything/openseadragon';
import { mountPlugin as mountBooleanPlugin } from '@annotorious/plugin-boolean-operations';
import { 
  Dispatch, 
  ReactNode, 
  SetStateAction, 
  createContext, 
  useContext, 
  useEffect, 
  useState 
} from 'react';

interface PluginProviderContextValue {

  samPlugin: ReturnType<typeof mountSAMPlugin>;

  samPluginBusy: boolean;

  samPluginError?: any;

  setSamPlugin: Dispatch<SetStateAction<ReturnType<typeof mountSAMPlugin>>>;

  booleanPlugin: ReturnType<typeof mountBooleanPlugin>;

  setBooleanPlugin: Dispatch<SetStateAction<ReturnType<typeof mountBooleanPlugin>>>;

}

// @ts-expect-error
export const PluginProviderContext = createContext<PluginProviderContextValue>();

export const PluginProvider = (props: { children: ReactNode }) => {

  const [samPlugin, setSamPlugin] = useState<ReturnType<typeof mountSAMPlugin>>();

  const [booleanPlugin, setBooleanPlugin] = useState<ReturnType<typeof mountBooleanPlugin>>();

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
    <PluginProviderContext.Provider value={{  
      samPlugin,
      samPluginBusy,
      samPluginError,
      setSamPlugin,
      booleanPlugin,
      setBooleanPlugin
    }}>
      {props.children}
    </PluginProviderContext.Provider> 
  )

}

export const useSAMPlugin = () => {
  const { samPlugin, samPluginBusy, samPluginError } = useContext(PluginProviderContext);
  return { samPlugin, samPluginBusy, samPluginError };
}

export const useBooleanPlugin = () => {
  const { booleanPlugin } = useContext(PluginProviderContext);
  return booleanPlugin;
}
