import { Folder } from 'lucide-react';
import { AnnotatedImage } from '@/model';
import { Button } from '@/components/Button';
import { useSetCollection } from '@/store';

import './Start.css';
import { useNavigate } from 'react-router-dom';

const readFileContent = (file: File): Promise<Blob> => 
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const contentArrayBuffer = event.target?.result as ArrayBuffer;
      const data = new Blob([contentArrayBuffer], { type: file.type });
      resolve(data);
    };

    reader.onerror = (event) => {
      reject(event.target?.error);
    };

    reader.readAsArrayBuffer(file);
  });

export const Start = () => {

  const navigate = useNavigate();

  const setCollection = useSetCollection();

  const images: AnnotatedImage[] = [];

  const onOpenFolder = async () => {
    const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });

    for await (const entry of dirHandle.values()) {
      const fileHandle = await dirHandle.getFileHandle(entry.name);
      const file = await fileHandle.getFile();
      const blob = await readFileContent(file);

      console.log(entry);

      images.push({
        name: entry.name,
        path: `${dirHandle.name}/${entry.name}`,
        blob
      })
    }

    setCollection({
      images,
      handle: dirHandle
    });

    navigate('/');
  }

  return (
    <main className="page start">
      <div className="cta">
        <h1 className="font-medium mb-2 text-lg">Welcome to I-MARKUS</h1>
        <p className="text-xs text-muted-foreground mb-6 max-w-md">
          Open an existing work folder, or a new folder with image files.
        </p>
        <Button onClick={onOpenFolder}>
          <Folder size={18} className="mr-2" /> Open Folder
        </Button>
      </div>
    </main>
  )

}