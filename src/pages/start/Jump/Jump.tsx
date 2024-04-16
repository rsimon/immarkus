import { useEffect, useState } from 'react';
import { getStoredHandles } from '../storedHandles';
import { Open } from '../Open';

interface JumpProps {

  to: string;

  onOpenFolder(handle?: FileSystemDirectoryHandle): void;

}

export const Jump = (props: JumpProps) => {

  const [storedHandles, setStoredHandles] = 
    useState<FileSystemDirectoryHandle[]>(undefined);

  useEffect(() => {
    getStoredHandles().then(setStoredHandles);
  }, []);

  useEffect(() => {
    if (!storedHandles) return;

    if (storedHandles.length >  0)
      props.onOpenFolder(storedHandles[storedHandles.length - 1]);
  }, [storedHandles]);

  // If there are no stored handles, show default Open page
  return storedHandles && storedHandles.length === 0 ? (
    <Open onOpenFolder={props.onOpenFolder} />
  ) : null;

}