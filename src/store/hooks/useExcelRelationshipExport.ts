import { useState } from 'react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { Store } from '../Store';
import { exportRelationshipsAsExcel } from '../export/exportRelationshipsAsExcel';

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