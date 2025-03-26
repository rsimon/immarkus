import { useState } from 'react';
import { useStore } from '@/store';
import { 
  exportFolders as _exportFolders, 
  exportImages as _exportImages 
} from './exportMetadata';

export const useMetadataExport = () => {

  const store = useStore();

  const [busy, setBusy] = useState(false);

  const [progress, setProgress] = useState(0);

  const onProgress = (progress: number) => {
    setProgress(progress);

    if (progress === 100)
      setBusy(false);
  }

  const exportFolders = (folderIds: string[]) => {
    setProgress(0);
    setBusy(true);
    _exportFolders(store, folderIds, onProgress)
  }

  const exportImages = (imageIds: string[]) => {
    setProgress(0);
    setBusy(true);
    _exportImages(store, imageIds, onProgress);
  }

  return {
    busy,
    exportFolders,
    exportImages,
    progress
  }

} 