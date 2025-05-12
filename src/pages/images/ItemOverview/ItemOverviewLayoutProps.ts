import { Folder, IIIFManifestResource, IIIFResource, Image, LoadedFileImage } from '@/model';
import { GridItem } from '../Types';

export interface ItemOverviewLayoutProps {

  annotationCounts: Record<string, number>;

  folders: Folder[];

  iiifResources: IIIFResource[];

  images: LoadedFileImage[];

  selected: GridItem;

  onOpenFolder(folder: Folder | IIIFManifestResource): void;

  onOpenImage(image: Image): void;

  onSelectFolder(folder: Folder): void;

  onSelectImage(image: Image): void;

  onSelectManifest(manifest: IIIFManifestResource): void;

}