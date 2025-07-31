import { useState } from 'react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import { exportRelationshipsAsExcel } from '@/store';
import { Store } from '../Store';

export const useExcelRelationshipExport = () => {

  const [busy, setBusy] = useState(false);

  const [progress, setProgress] = useState(0);

  const exportRelationships = (
    store: Store, 
    relationships: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][], 
    filename: string
  ) => {    
    setProgress(0);
    setBusy(true);

    const onProgress = (progress: number) => {
      setProgress(progress);
  
      if (progress === 100)
        setBusy(false);
    }

    exportRelationshipsAsExcel(store, relationships, onProgress, filename);
  }
  
  return { busy, progress, exportRelationships };

}