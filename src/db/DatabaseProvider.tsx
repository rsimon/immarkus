import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Database, initDB } from './db';

const DatabaseContext = createContext<Database | null>(null);

interface DatabaseContextProviderProps {

  children: ReactNode;

  onDBInitError?: () => void;

}

export const DatabaseProvider = (props: DatabaseContextProviderProps) => {

  const [database, setDatabase] = useState<Database | null>(null);

  useEffect(() => {
    initDB()
      .then(setDatabase)
      .catch(() => props.onDBInitError && props.onDBInitError());
  }, []);

  return (
    <DatabaseContext.Provider value={database}>
      {database ? props.children : undefined }
    </DatabaseContext.Provider>
  )

}

export const useDatabase = () => useContext(DatabaseContext)!;