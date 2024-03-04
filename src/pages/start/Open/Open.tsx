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
    <div className="flex flex-col w-full">
      <main className="flex items-center justify-center">
        <div className="cta pt-20 text-center">
          <h1 className="font-medium mb-4 text-lg">Welcome to IMMARKUS</h1>
          <div className="buttons flex justify-center gap-2">
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

      <footer className="text-xs p-4 w-full flex justify-center">
        <div className="max-w-4xl text-center text-muted-foreground leading-relaxed">
          Developed by Prof. Dr. Hilde De Weerdt, Dr. Rainer Simon, Dr. Lee Sunkyu, Dr. 
          Iva Stojević, Meret Meister, and Xi Wangzhi with funding from the European 
          Research Council under the Horizon 2020 programme, grant agreement No. 
          101019509. <a className="text-sky-700 underline" href="https://github.com/rsimon/immarkus/wiki" target="_blank">Learn more</a>.
        </div>
      </footer>
    </div>
  )

}