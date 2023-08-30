import { useEffect, useState } from 'react';
import { Folder } from 'lucide-react';
import { Button } from '@/components/Button';
import { useDatabase } from '@/db';

import './Open.css';

interface OpenProps {

  onOpenFolder(handle?: FileSystemDirectoryHandle): void;

}

export const Open = (props: OpenProps) => {

  const [storedHandle, setStoredHandle] = 
    useState<FileSystemDirectoryHandle | undefined>();

  const db = useDatabase();

  useEffect(() => {
    // Retrieve stored dir handle on mount, if any
    db.handles.toArray().then(handles => {
      if (handles.length > 0)
        setStoredHandle(handles[0].handle);
    });
  }, []);

  return (
    <main className="page start open">
      <div className="cta">
        <h1 className="font-medium mb-4 text-lg">Welcome to I-MARKUS</h1>
        <div className="buttons">
          <Button 
            onClick={() => props.onOpenFolder()}>
            <Folder size={18} className="mr-2" /> Open New Folder
          </Button>

          {Boolean(storedHandle) && (
            <Button 
              variant="outline"
              onClick={() => props.onOpenFolder(storedHandle)}>
              <Folder size={18} className="mr-2" /> {storedHandle!.name}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Open an existing work folder, or a new folder with image files.
        </p>
      </div>
    </main>
  )

}