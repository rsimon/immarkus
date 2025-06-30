import { useEffect } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { FileImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';

export const useCopySelectedAnnotation = (images: LoadedImage[]) => {

  const selection = useSelection();

  useEffect(() => {
    if (selection.selected.length !== 1) return;

    const { id: imageId } = selection;

    const annotation = selection.selected[0].annotation as ImageAnnotation;

    const image = images.find(i => i.id === imageId);
    if (!image) {
      // Should never happen
      console.warn(`Invalid selection: image ${imageId} not in workspace`);
      return;
    }

    const onKeydown = (evt: KeyboardEvent) => {
      if (!(evt.key === 'c' && (evt.metaKey || evt.ctrlKey))) return;

      getImageSnippet(image, annotation, true, 'png').then((snippet: FileImageSnippet) => {
        const blob = new Blob([snippet.data], { type: 'image/png' });
        
        const clipboardItem = new ClipboardItem({
          'image/png': blob
        });

        navigator.clipboard.write([clipboardItem]).then(() => {
          console.log('Done.');
        });
      });
    }

    document.body.addEventListener('keydown', onKeydown);
    
    return () => {
      document.body.removeEventListener('keydown', onKeydown);
    }
  }, [selection.selected, images]);
  
}