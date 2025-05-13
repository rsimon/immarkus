import { Folder, IIIFManifestResource, IIIFResource, Image, LoadedFileImage } from '@/model';
import { AnnotationMap, OverviewItem } from '../Types';

export interface ItemOverviewLayoutProps {

  annotations: AnnotationMap;

  folders: Folder[];

  iiifResources: IIIFResource[];

  images: LoadedFileImage[];

  selected: OverviewItem;

  onOpenFolder(folder: Folder | IIIFManifestResource): void;

  onOpenImage(image: Image): void;

  onSelectFolder(folder: Folder): void;

  onSelectImage(image: Image): void;

  onSelectManifest(manifest: IIIFManifestResource): void;

}