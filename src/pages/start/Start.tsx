import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/db';
import { useInitStore } from '@/store/StoreProvider';
import { Loading } from './Loading';
import { Open } from './Open';
import { UnsupportedBrowser } from './UnsupportedBrowser';

import './Start.css';

type State = 'idle' | 'loading' | 'error';

export const Start = () => {

  const [state, setState] = useState<State>('idle');

  const [progress, setProgress] = useState(0);

  const initStore = useInitStore();

  const db = useDatabase();

  const navigate = useNavigate();

  const onOpenFolder = async (storedHandle?: FileSystemDirectoryHandle) => {
    try {
      // Use stored handle or request new
      let handle = storedHandle;

      if (handle) {
        const permissions = await handle.requestPermission({ mode: 'readwrite' });
        if (permissions !== 'granted')
          throw new Error('File access denied by user');
      } else {
        handle = await window.showDirectoryPicker({ mode: 'readwrite' });

        // Persist new handle
        db.handles.clear();
        db.handles.add({ handle, created: new Date() });
      }

      // Loading!
      setState('loading');
      await initStore(handle, setProgress);
      
      // Done - navigate to root
      navigate('/'); 
    } catch (error) {
      console.error(error);
      setState('error');
    }
  }

  return ( 
    <div className="page-root">
      {!window.showDirectoryPicker ? (
        <UnsupportedBrowser />
      ) : state === 'loading' ? (
        <Loading progress={progress} />
      ) : (
        <Open onOpenFolder={onOpenFolder} />
      )}
    </div>
  )

}