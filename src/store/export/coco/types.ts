export interface COCOInfo {

  description: string;

  version: string;

  year: number;

  date_created: string;

}

export interface COCOImage {

  id: number;

  file_name: string;

  width: number;

  height: number;

}

export interface COCOCategory {

  id: number;

  name: string;

  supercategory: string;

}

export interface COCOAnnotation {

  id: number;

  image_id: number;

  category_id: number;

  bbox: [number, number, number, number];

  segmentation: number[][];

  area: number;

  iscrowd: 0 | 1;

}

export interface COCODataset {

  info: COCOInfo;

  images: COCOImage[];

  categories: COCOCategory[];

  annotations: COCOAnnotation[];

}
