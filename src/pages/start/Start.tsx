import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInitStore } from '@/store';
import { Loading } from './Loading';
import { Open } from './Open';
import { UnsupportedBrowser } from './UnsupportedBrowser';
import { storeHandle } from './storedHandles';
import { Jump } from './Jump';

type State = 'idle' | 'loading' | 'error';

interface StartProps {

  redirectTo?: string;
  
}

export const Start = (props: StartProps) => {

  const [state, setState] = useState<State>('idle');

  const initStore = useInitStore();

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
        storeHandle(handle);
      }

      // Loading!
      setState('loading');
      await initStore(handle);
      
      // Done - navigate to root
      navigate(props.redirectTo || '/'); 
    } catch (error) {
      console.error(error);
      setState('error');
    }
  }

  const buildDate = 
    new Intl.DateTimeFormat('de', { day: '2-digit', month: '2-digit', year: 'numeric' })
      .format(new Date(process.env.BUILD_DATE));

  return ( 
    <div className="page-root">
      <div className="absolute top-2 right-2 text-xs text-muted-foreground/50" aria-hidden={true}>
        v{process.env.PACKAGE_VERSION} · Build {buildDate}
      </div>

      {!window.showDirectoryPicker ? (
        <UnsupportedBrowser />
      ) : state === 'loading' ? (
        <Loading />
      ) : props.redirectTo ? (
        <Jump to={props.redirectTo} onOpenFolder={onOpenFolder} />
      ) : (
        <Open onOpenFolder={onOpenFolder} />
      )}
    </div>
  )

}