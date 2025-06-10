import { CozyCanvas } from 'cozy-iiif';

export interface Image {

  id: string;

  name: string;

  path: string[];

  folder: FileSystemDirectoryHandle;

}

export interface FileImage extends Image {

  file: File;

}

export interface LoadedFileImage extends FileImage {

  data: Blob;

}

export interface LoadedIIIFImage extends Image  {

  canvas: CozyCanvas;

  manifestId: string;

}

export type LoadedImage = LoadedFileImage | LoadedIIIFImage