import { useState } from 'react';
import { Image } from '@/model';
import { exportAnnotationsAsExcel, useStore } from '@/store';

export const useExcelAnnotationExport = () => {

  const store = useStore();

  const [busy, setBusy] = useState(false);

  const [progress, setProgress] = useState(0);

  const exportAnnotations = (images?: Image[]) => {
    const imagesToExport = images || store.images;
    
    setBusy(true);

    const onProgress = (progress: number) => {
      setProgress(progress);
  
      if (progress === 100)
        setBusy(false);
    }

    exportAnnotationsAsExcel(store, imagesToExport, onProgress);
  }

  return {
    busy,
    exportAnnotations,
    progress
  }

} 