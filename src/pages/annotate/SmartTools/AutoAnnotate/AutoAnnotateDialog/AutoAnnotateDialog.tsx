import { LoadedImage } from '@/model';
import { AnnotationBatch } from '../../AnnotationBatch';

interface AutoAnnotateDialogProps {

  disabled?: boolean;

  image: LoadedImage;

  onImport(batches: AnnotationBatch[]): void;

}


export const AutoAnnotateDialog = (props: AutoAnnotateDialogProps) => {

  return (
    <div>Hello World</div>
  )

}