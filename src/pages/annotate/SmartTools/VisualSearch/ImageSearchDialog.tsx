import { useEffect } from 'react';
import type { ImageAnnotation } from '@annotorious/react';
import { useSelection } from '@annotorious/react-manifold';
import { LoadedImage } from '@/model';
import { useVisualSearch } from '@/pages/visualsearch/useVisualSearch';
import { Dialog, DialogContent, DialogTitle } from '@/ui/Dialog';
import { FileImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';

interface ImageSearchDialogProps {

  images: LoadedImage[];

  open: boolean;

  onClose(): void;

}

export const ImageSearchDialog = (props: ImageSearchDialogProps) => {

  const { selected } = useSelection();

  const vs = useVisualSearch();

  const onOpenChange = (open: boolean) => {
    if (!open)
      props.onClose();
  }

  useEffect(() => {
    if (!props.open || selected.length !== 1) return;

    const { annotation, annotatorId } = selected[0]; 

    const image = props.images.find(i => i.id === annotatorId);

    if (!image) return;

    getImageSnippet(
      image, 
      annotation as ImageAnnotation, 
      true, // if IIIF -> download
      'png'
    ).then((snippet: FileImageSnippet) => {
      console.debug('Running similarity search');

      const blob = new Blob([snippet.data as BlobPart], { type: 'image/png' });

      vs.index.query(blob).then(result => {
        console.log(result);
      })
    });
  }, [props.open, vs, selected, props.images]);

  return (
    <Dialog
      open={props.open} 
      onOpenChange={onOpenChange}>
      <DialogContent 
        className="rounded-lg flex flex-col md:w-auto h-11/12 max-w-11/12 p-0 
          overflow-hidden relative gap-1">
        <DialogTitle>
          Search Results
        </DialogTitle>

        Hello World
        
      </DialogContent>
    </Dialog>
  )

}