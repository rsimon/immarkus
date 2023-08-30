import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDatabase } from '@/db';
import { AnnotatedImage } from '@/model';
import { useSetCollection } from '@/store';
import { readFile } from './readFile';
import { Loading } from './Loading';
import { Open } from './Open';

import './Start.css';

type State = 'idle' | 'loading' | 'error';

export const Start = () => {

  const [state, setState] = useState<State>('idle');

  const [storedHandle, setStoredHandle] = useState<FileSystemDirectoryHandle | undefined>();

  const [progress, setProgress] = useState(0);

  const setCollection = useSetCollection();

  const db = useDatabase();

  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve stored dir handle on mount, if any
    db.handles.toArray().then(handles => {
      if (handles.length > 0)
        setStoredHandle(handles[0].handle);
    });
  }, []);

  const onOpenFolder = async () => {
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

      await files.reduce((promise, file, index) => promise.then(() =>
        readFile(file).then(data => {
          images.push({
            name: file.name,
            path: `${handle!.name}/${file.name}`,
            data
          });

          setProgress(Math.round(100 * index / files.length));
        })
      ), Promise.resolve());

      setProgress(100);
      setCollection({ images, handle });
      
      navigate('/'); 
    } catch (error) {
      console.error(error)
      setState('error');
    }
  }

  return state === 'idle' ? (
    <Open onOpenFolder={onOpenFolder} />
  ) : state === 'loading' ? (
    <Loading progress={progress} />
  ) : (
    <div></div>
  )

}