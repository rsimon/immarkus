import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { Condition, KnowledgeGraphSettings, ObjectType } from './Types';

interface KnowledgeGraphStateContextValue {

  searchObjectType?: ObjectType;

  searchConditions: Condition[];

  setSearchObjectType(type?: ObjectType): void;

  setSearchConditions: Dispatch<SetStateAction<Condition[]>>;

  settings: KnowledgeGraphSettings;

  setSettings: Dispatch<SetStateAction<KnowledgeGraphSettings>>;

  showGraphSearch: boolean;

  setShowGraphSearch: Dispatch<SetStateAction<boolean>>;

}

const KnowledgeGraphStateContext = createContext<KnowledgeGraphStateContextValue>(undefined);

export const KnowledgeGraphStateProvider = (props: { children: ReactNode }) => {

  const [settings, setSettings] = useState<KnowledgeGraphSettings>({ graphMode: 'HIERARCHY' });

  const [searchObjectType, setSearchObjectType] = useState<ObjectType | undefined>();

  const [searchConditions, setSearchConditions] = useState<Condition[]>([]);

  const [showGraphSearch, setShowGraphSearch] = useState(false);

  return (
    <KnowledgeGraphStateContext.Provider 
      value={{ 
        settings, 
        searchConditions,
        searchObjectType,
        showGraphSearch,
        setSettings,
        setSearchConditions, 
        setSearchObjectType,
        setShowGraphSearch 
      }}>
      {props.children}
    </KnowledgeGraphStateContext.Provider>
  )

}

export const useKnowledgeGraphSettings = () => {
  const { settings, setSettings } = useContext(KnowledgeGraphStateContext);
  return { settings, setSettings };
}

export const useKnowledgeGraphSettingsValue = () => {
  const { settings } = useContext(KnowledgeGraphStateContext);
  return settings;
}

export const useSearchState = () => {
  const { 
    searchConditions, 
    searchObjectType, 
    setSearchConditions,
    setSearchObjectType 
  } = useContext(KnowledgeGraphStateContext);
  
  return { 
    conditions: searchConditions, 
    setConditions: setSearchConditions,
    objectType: searchObjectType,
    setObjectType: setSearchObjectType 
  };
}

export const useShowGraphSearch = () => {
  const { showGraphSearch, setShowGraphSearch } = useContext(KnowledgeGraphStateContext);
  return { showGraphSearch, setShowGraphSearch };
}