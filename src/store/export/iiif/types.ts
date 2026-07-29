import { FileImage, Folder, LoadedFileImage } from '@/model';

export interface IIIFMetadataField {

  label: { en: string[] };

  value: { en: string[] };

}

export interface FolderTree {

  folder: Folder;

  // Folder names from the exported root folder down to this folder
  relPath: string[];

  images: FileImage[];

  children: FolderTree[];

}

// A single flattened image, together with the folder path
export interface FlattenedImage {

  image: LoadedFileImage;

  dir: string;

}
