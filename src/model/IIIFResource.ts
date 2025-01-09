/** Data contained in a descriptor JSON file */
interface BaseIIIFResourceInformation {

  name: string;

  uri: string;

  importedAt: string;

  majorVersion: number;

}

export interface IIIFManifestResourceInformation extends BaseIIIFResourceInformation {

  type: 'PRESENTATION_MANIFEST';

  canvases: CanvasInformation[];

}

export interface CanvasInformation{

  id: string;

  uri: string;

  label: string;

}

export interface IIIFImageResourceInformation extends BaseIIIFResourceInformation {

  type: 'IIIF_IMAGE';

}

export type IIIFResourceInformation = IIIFManifestResourceInformation | IIIFImageResourceInformation;

/** Full resources from parsed JSON info file (IIIF + descriptor file meta) **/
interface BaseIIIFResource {

  id: string;

  path: string[];

  folder: FileSystemDirectoryHandle;

}

export type IIIFManifestResource = IIIFManifestResourceInformation & BaseIIIFResource;

export type IIIFImageResource = IIIFImageResourceInformation & BaseIIIFResource;

export type IIIFResource = IIIFManifestResource | IIIFImageResource;