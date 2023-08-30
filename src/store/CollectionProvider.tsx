import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersistentCollection } from '@/model';

interface CollectionContextState {

  collection?: PersistentCollection;

  setCollection: React.Dispatch<React.SetStateAction<PersistentCollection | undefined>>

}

//@ts-ignore
const CollectionContext = createContext<CollectionContextState>(undefined);

interface CollectionContextProps {

  children: ReactNode;

}

export const CollectionProvider = (props: CollectionContextProps) => {

  const [collection, setCollection] = useState<PersistentCollection | undefined>(undefined);

  return (
    <CollectionContext.Provider value={{ collection, setCollection }}>
      {props.children}
    </CollectionContext.Provider>
  )

}

export const useSetCollection = () => {
  const { setCollection }  = useContext(CollectionContext);
  return setCollection;
}

export const useCollection = (args: { redirect: boolean } = { redirect: false }) => {
  const { collection } = useContext(CollectionContext);

  const navigate = args.redirect && useNavigate();

  useEffect(() => {
    if (!collection && navigate)
      navigate('/');
  }, []);

  return collection;
}