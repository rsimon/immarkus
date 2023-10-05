import { useEffect, useState } from 'react';
import { Folder } from 'lucide-react';
import { Button } from '@/ui/Button';
import { getStoredHandles } from '../storedHandles';

import './Open.css';

interface OpenProps {

  onOpenFolder(handle?: FileSystemDirectoryHandle): void;

}

export const Open = (props: OpenProps) => {

  const [storedHandles, setStoredHandles] = 
    useState<FileSystemDirectoryHandle[]>([]);

  useEffect(() => {
    getStoredHandles().then(setStoredHandles);
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

          {storedHandles.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => props.onOpenFolder(storedHandles[storedHandles.length - 1])}>
              <Folder size={18} className="mr-2" /> {storedHandles[storedHandles.length - 1]!.name}
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