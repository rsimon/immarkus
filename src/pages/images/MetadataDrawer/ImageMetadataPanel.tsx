import { useImageMetadata } from '@/store';
import { ImageGridItem } from '../ItemGrid';

interface ImageMetadataPanelProps {

  image: ImageGridItem;

}

export const ImageMetadataPanel = (props: ImageMetadataPanelProps) => {

  const metadata = useImageMetadata(props.image.id);

  return (
    <div>
      Image metadata...
    </div>
  )

}