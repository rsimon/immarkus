export interface IIIFResource {

  uri: string;

  importedAt: string;

  name: string;

  type: 'image' | 'manifest';

  majorVersion: number;

  pages: number;

}