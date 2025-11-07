import { useState } from 'react';
import { CanvasInformation, IIIFManifestResource, Image } from '@/model';
import { exportAnnotationsAsExcel, useStore } from '@/store';

export type SnippetExportMode = 'masked' | 'unmasked';

export const useExcelAnnotationExport = (mode: SnippetExportMode = 'unmasked') => {

  const store = useStore();

  const [busy, setBusy] = useState(false);

  const [progress, setProgress] = useState(0);

  const exportAnnotations = (images?: (Image | CanvasInformation)[], filename?: string) => {
    const imagesToExport: (Image | CanvasInformation)[] = images || [
      ...store.images,
      ...store.iiifResources.reduce((all, manifest) => ([
        ...all, 
        ...(manifest as IIIFManifestResource).canvases
      ]), [])
    ];
    
    setProgress(0);
    setBusy(true);

    const onProgress = (progress: number) => {
      setProgress(progress);
  
      if (progress === 100)
        setBusy(false);
    }

    exportAnnotationsAsExcel(store, imagesToExport, onProgress, mode === 'masked', filename);
  }

  return {
    busy,
    exportAnnotations,
    progress
  }

} 