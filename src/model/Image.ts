import { Canvas } from "@iiif/presentation-3";

export interface Image {

  id: string;

  name: string;

  path: string[];

  folder: FileSystemDirectoryHandle;

}

export interface LoadedFileImage extends Image {

  file: File;

  data: Blob;

}

export interface LoadedIIIFImage extends Image  {

  canvas: Canvas;

  manifestId: string;

}

export type LoadedImage = LoadedFileImage | LoadedIIIFImage