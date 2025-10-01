import { useCallback, useEffect, useMemo, useState } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { FileImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';

type CopyStatus = 'idle' | 'busy' | 'success' | 'failed';

export const useCopyToClipboard = (
  images: LoadedImage[], 
  applyMask: boolean,
  resetStatusAfter = 2000
) => {

  const selection = useSelection();

  const canCopy = useMemo(() => {
    if (selection.selected.length !== 1) return false;

    const image = images.find(i => i.id === selection.selected[0].annotatorId);
    if (!image) {
      // Should never happen
      console.warn(`Invalid selection: image ${selection.selected[0].annotatorId} not in workspace`);
      return false;
    }

    return true;
  }, [selection.selected, images])

  const [status, setStatus] = useState<CopyStatus>('idle');

  const copyToClipboard = useCallback(() => {
    if (!canCopy) return;

    const image = images.find(i => i.id === selection.selected[0].annotatorId);
    const annotation = selection.selected[0].annotation as ImageAnnotation;
    
    setStatus('busy');

    getImageSnippet(image, annotation, true, 'png', applyMask).then((snippet: FileImageSnippet) => {
      const blob = new Blob([snippet.data as BlobPart], { type: 'image/png' });
      
      const clipboardItem = new ClipboardItem({
        'image/png': blob
      });

      navigator.clipboard.write([clipboardItem])
        .then(() => setStatus('success'))
        .catch(error => {
          console.error(error);
          setStatus('failed');
        });
    });
  }, [selection.selected, images, canCopy, applyMask])

  useEffect(() => {
    if (!canCopy) return;

    const onKeydown = (evt: KeyboardEvent) => {
      if (!(evt.key === 'c' && (evt.metaKey || evt.ctrlKey))) return;

      const nodeName = (evt.target as Node).nodeName;
      if (nodeName === 'TEXTAREA' || nodeName === 'INPUT') return;

      copyToClipboard();        
    }

    document.body.addEventListener('keydown', onKeydown);
    
    return () => {
      document.body.removeEventListener('keydown', onKeydown);
    }
  }, [copyToClipboard, canCopy]);

  useEffect(() => {
    if (status === 'success' || status === 'failed')
      setTimeout(() => setStatus('idle'), resetStatusAfter);
  }, [status, resetStatusAfter]);

  return { canCopy, status, copyToClipboard };
  
}