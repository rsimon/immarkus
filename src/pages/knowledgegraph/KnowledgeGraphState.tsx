import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { Condition, GraphNode, KnowledgeGraphSettings, ObjectType } from './Types';
import { NodeObject } from 'react-force-graph-2d';

interface KnowledgeGraphStateContextValue {

  searchObjectType?: ObjectType;

  searchConditions: Condition[];

  selectedNodes: NodeObject<GraphNode>[];

  settings: KnowledgeGraphSettings;

  showGraphSearch: boolean;

  setSearchObjectType(type?: ObjectType): void;

  setSearchConditions: Dispatch<SetStateAction<Condition[]>>;

  setSelectedNodes: Dispatch<SetStateAction<NodeObject<GraphNode>[]>>;

  setSettings: Dispatch<SetStateAction<KnowledgeGraphSettings>>;

  setShowGraphSearch: Dispatch<SetStateAction<boolean>>;

}

const KnowledgeGraphStateContext = createContext<KnowledgeGraphStateContextValue>(undefined);

export const KnowledgeGraphStateProvider = (props: { children: ReactNode }) => {

  const [selectedNodes, setSelectedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const [settings, setSettings] = useState<KnowledgeGraphSettings>({ graphMode: 'HIERARCHY' });

  const [searchObjectType, setSearchObjectType] = useState<ObjectType | undefined>();

  const [searchConditions, setSearchConditions] = useState<Condition[]>([]);

  const [showGraphSearch, setShowGraphSearch] = useState(false);

  return (
    <KnowledgeGraphStateContext.Provider 
      value={{ 
        searchConditions,
        searchObjectType,
        selectedNodes,
        settings, 
        showGraphSearch,
        setSearchConditions, 
        setSearchObjectType,
        setSelectedNodes,
        setSettings,
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

export const useSelectedNodes = () => {
  const { selectedNodes, setSelectedNodes } = useContext(KnowledgeGraphStateContext);
  return { selectedNodes, setSelectedNodes };
}