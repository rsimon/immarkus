import { useState } from 'react';
import { CanvasInformation, IIIFManifestResource, Image } from '@/model';
import { ExcelAnnotationExportOpts, exportAnnotationsAsExcel, useStore } from '@/store';

export type SnippetExportMode = 'masked' | 'unmasked' | 'no-snippet';

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

    const opts: ExcelAnnotationExportOpts = {
      includeSnippets: mode !== 'no-snippet',
      snippetMode: mode === 'no-snippet' ? undefined : mode,
      filename
    };

    exportAnnotationsAsExcel(store, imagesToExport, onProgress, opts);
  }

  return {
    busy,
    exportAnnotations,
    progress
  }

} 