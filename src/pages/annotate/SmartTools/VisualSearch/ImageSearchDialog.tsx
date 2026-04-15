import { LoadedImage } from '@/model';
import { useVisualSearch } from '@/pages/visualsearch/useVisualSearch';
import { Dialog, DialogContent } from '@/ui/Dialog';

interface ImageSearchDialogProps {

  images: LoadedImage[];

  open: boolean;

  onClose(): void;

}

export const ImageSearchDialog = (props: ImageSearchDialogProps) => {

  const vs = useVisualSearch();

  const onOpenChange = (open: boolean) => {
    if (!open)
      props.onClose();
  }

  /*
  const onSearchImages = () => {
      const { annotation, annotatorId } = selected[0];
  
      const image = props.images.find(i => i.id === annotatorId);
  
      console.log('running similarity search');
  
      getImageSnippet(
        image, 
        annotation as ImageAnnotation, 
        true, // Download IIIF
        'png'
      ).then((snippet: FileImageSnippet) => {
        const blob = new Blob([snippet.data as BlobPart], { type: 'image/png' });
        vs.index.query(blob as File).then(result => {
          console.log(result);
        })
      });
    }
  */

  return (
    <Dialog
      open={props.open} 
      onOpenChange={onOpenChange}>
      <DialogContent 
        className="rounded-lg flex flex-col md:w-auto h-11/12 max-w-11/12 p-0 
          overflow-hidden relative gap-1">

        Hello World
        
      </DialogContent>
    </Dialog>
  )

}