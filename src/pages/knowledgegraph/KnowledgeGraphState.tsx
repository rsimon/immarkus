import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import type { NodeObject } from 'react-force-graph-2d';
import { Condition, GraphNode, KnowledgeGraphSettings, ObjectType } from './Types';

type Point = { x: number, y: number };

interface KnowledgeGraphStateContextValue {

  searchConditions: Condition[];

  searchDialogPos?: Point;

  searchObjectType?: ObjectType;

  selectedNodes: NodeObject<GraphNode>[];

  settings: KnowledgeGraphSettings;

  showGraphSearch: boolean;

  setSearchConditions: Dispatch<SetStateAction<Condition[]>>;

  setSearchDialogPos: Dispatch<SetStateAction<Point>>;

  setSearchObjectType: Dispatch<SetStateAction<ObjectType | undefined>>;

  setSelectedNodes: Dispatch<SetStateAction<NodeObject<GraphNode>[]>>;

  setSettings: Dispatch<SetStateAction<KnowledgeGraphSettings>>;

  setShowGraphSearch: Dispatch<SetStateAction<boolean>>;

}

const KnowledgeGraphStateContext = createContext<KnowledgeGraphStateContextValue>(undefined);

export const KnowledgeGraphStateProvider = (props: { children: ReactNode }) => {

  const [searchConditions, setSearchConditions] = useState<Condition[]>([]);

  const [searchDialogPos, setSearchDialogPos] = useState<Point | undefined>();
 
  const [searchObjectType, setSearchObjectType] = useState<ObjectType | undefined>();

  const [selectedNodes, setSelectedNodes] = useState<NodeObject<GraphNode>[]>([]);

  const [settings, setSettings] = useState<KnowledgeGraphSettings>({ graphMode: 'HIERARCHY' });

  const [showGraphSearch, setShowGraphSearch] = useState(false);

  return (
    <KnowledgeGraphStateContext.Provider 
      value={{ 
        searchConditions,
        searchDialogPos,
        searchObjectType,
        selectedNodes,
        settings, 
        showGraphSearch,
        setSearchConditions, 
        setSearchDialogPos,
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

export const useSearchDialogPos = (initial?: Point) => {
  const { searchDialogPos, setSearchDialogPos } = useContext(KnowledgeGraphStateContext);

  useEffect(() => {
    if (!searchDialogPos && initial)
      setSearchDialogPos(initial);
  }, [searchDialogPos, setSearchDialogPos]);

  return { position: searchDialogPos || initial, setPosition: setSearchDialogPos };
}