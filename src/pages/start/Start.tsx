import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/db';
import { AnnotatedImage } from '@/model';
import { useSetCollection } from '@/store';
import { readFile } from './readFile';
import { Loading } from './Loading';
import { Open } from './Open';

import './Start.css';
import { UnsupportedBrowser } from './UnsupportedBrowser';

type State = 'idle' | 'loading' | 'error';

export const Start = () => {

  const [state, setState] = useState<State>('idle');

  const [progress, setProgress] = useState(0);

  const setCollection = useSetCollection();

  const db = useDatabase();

  const navigate = useNavigate();

  const onOpenFolder = async (storedHandle?: FileSystemDirectoryHandle) => {
    try {
      let handle = storedHandle;

      if (handle) {
        const permissions = await handle.requestPermission({ mode: 'readwrite' });
        if (permissions !== 'granted')
          throw new Error('File access denied by user');
      } else {
        handle = await window.showDirectoryPicker({ mode: 'readwrite' });

        // Persist this handle
        db.handles.clear();
        db.handles.add({ handle, created: new Date() });
      }

      setState('loading');

      const files = [];

      for await (const entry of handle.values()) {
        const fileHandle = await handle.getFileHandle(entry.name);
        const file = await fileHandle.getFile();
        files.push(file);
      }

      const images: AnnotatedImage[] = [];

      await files.reduce((promise, file, index) => file.type.startsWith('image') ? 
        promise.then(() => 
          readFile(file).then(data => {
            images.push({
              name: file.name,
              path: `${handle!.name}/${file.name}`,
              data
            });

            setProgress(Math.round(100 * index / files.length));
          }) 
      ) : promise, Promise.resolve());

      setProgress(100);
      setCollection({ name: handle.name, images, handle });
      
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