import { Folder, Image } from '@/model';

export type FolderGridItem = Folder & {

  type: 'folder';

}

export type ImageGridItem = Image & {

  type: 'image'

}

export type GridItem = FolderGridItem | ImageGridItem;