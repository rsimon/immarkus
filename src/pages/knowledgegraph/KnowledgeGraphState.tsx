import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { Condition, KnowledgeGraphSettings } from './Types';

interface KnowledgeGraphSettingsContextValue {

  conditions: Condition[];

  setConditions: Dispatch<SetStateAction<Condition[]>>;

  settings: KnowledgeGraphSettings;

  setSettings: Dispatch<SetStateAction<KnowledgeGraphSettings>>;

}

const KnowledgeGraphSettingsContext = createContext<KnowledgeGraphSettingsContextValue>(undefined);

export const KnowledgeGraphSettingsProvider = (props: { children: ReactNode }) => {

  const [settings, setSettings] = useState<KnowledgeGraphSettings>({ graphMode: 'HIERARCHY' });

  const [conditions, setConditions] = useState<Condition[]>([]);

  return (
    <KnowledgeGraphSettingsContext.Provider value={{ conditions, settings, setConditions, setSettings }}>
      {props.children}
    </KnowledgeGraphSettingsContext.Provider>
  )

}

export const useKnowledgeGraphSettings = () => {
  const { settings, setSettings } = useContext(KnowledgeGraphSettingsContext);
  return { settings, setSettings };
}

export const useKnowledgeGraphSettingsValue = () => {
  const { settings } = useContext(KnowledgeGraphSettingsContext);
  return settings;
}

export const useSearchConditions = () => {
  const { conditions, setConditions } = useContext(KnowledgeGraphSettingsContext);
  return { conditions, setConditions };
}