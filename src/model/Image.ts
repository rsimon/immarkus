export interface Image {

  id: string;

  name: string;

  path: string[];

  file: File;

  folder: FileSystemDirectoryHandle;

}

export interface LoadedImage extends Image {

  data: Blob;

}