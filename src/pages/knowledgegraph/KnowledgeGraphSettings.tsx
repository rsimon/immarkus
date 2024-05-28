import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { KnowledgeGraphSettings } from './Types';

interface KnowledgeGraphSettingsContextValue {

  settings: KnowledgeGraphSettings;

  setSettings: Dispatch<SetStateAction<KnowledgeGraphSettings>>;

}

const KnowledgeGraphSettingsContext = createContext<KnowledgeGraphSettingsContextValue>(undefined);

export const KnowledgeGraphSettingsProvider = (props: { children: ReactNode }) => {

  const [settings, setSettings] = useState<KnowledgeGraphSettings>({});

  return (
    <KnowledgeGraphSettingsContext.Provider value={{ settings, setSettings }}>
      {props.children}
    </KnowledgeGraphSettingsContext.Provider>
  )

}

export const useKnowledgeGraphSettings = () => useContext(KnowledgeGraphSettingsContext);

export const useKnowledgeGraphSettingsValue = () => {
  const { settings } = useContext(KnowledgeGraphSettingsContext);
  return settings;
}
