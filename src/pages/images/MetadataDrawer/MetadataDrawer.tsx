import { FolderGridItem, GridItem, ImageGridItem } from '../ItemGrid';
import { FolderMetadataPanel } from './FolderMetadataPanel';
import { ImageMetadataPanel } from './ImageMetadataPanel';
import { Drawer } from '@/components/Drawer';

interface MetadataDrawerProps {

  item?: GridItem;

  onClose(): void;

}

export const MetadataDrawer = (props: MetadataDrawerProps) => {

  return (
    <Drawer
      data={props.item}
      onClose={props.onClose}
      content={item => item.type === 'folder' ? (
        <FolderMetadataPanel 
          folder={item as FolderGridItem} />
      ) : item.type === 'image' && (
        <ImageMetadataPanel 
          image={item as ImageGridItem} />
      )} />
  )

}