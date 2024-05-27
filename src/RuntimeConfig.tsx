import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { ExternalAuthority } from './model/ExternalAuthority';

export interface RuntimeConfiguration {

  authorities: ExternalAuthority[];
  
  model_presets?: ModelPreset[];

}

export interface ModelPreset {

  type: 'ENTITY_TYPES' | 'FOLDER_SCHEMAS' | 'IMAGE_SCHEMAS';

  name: string;

  url: string;

}

const RuntimeConfigContext = createContext<RuntimeConfiguration>(undefined);

export const RuntimeConfig = (props: { children: ReactNode }) => {

  const [config, setConfig] = useState<RuntimeConfiguration | undefined>();

  useEffect(() => {
    fetch('config.json')
      .then(res => res.json())
      .then(setConfig);
  }, []);

  return (
    <RuntimeConfigContext.Provider value={config}>
      {config && (props.children)}
    </RuntimeConfigContext.Provider>
  )

}

export const useRuntimeConfig = () => useContext(RuntimeConfigContext);