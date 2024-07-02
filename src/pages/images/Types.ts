import { Folder, Image, RootFolder } from '@/model';

export type FolderGridItem = (Folder | RootFolder) & {

  type: 'folder';

}

export type ImageGridItem = Image & {

  type: 'image'

}

export type GridItem = FolderGridItem | ImageGridItem;