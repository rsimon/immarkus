import { Folder, IIIFManifestResource, IIIFResource, Image, LoadedFileImage } from '@/model';
import { AnnotationMap, OverviewItem } from '../Types';

export interface ItemOverviewLayoutProps {

  annotations: AnnotationMap;

  folders: Folder[];

  hideUnannotated: boolean;

  iiifResources: IIIFResource[];

  images: LoadedFileImage[];

  selected: OverviewItem;

  onOpenFolder(folder: Folder | IIIFManifestResource): void;

  onOpenImage(imageId: string): void;

  onSelectFolder(folder: Folder): void;

  onSelectImage(image: Image): void;

  onSelectItem(item: OverviewItem): void;

}