export const parseIIIFId = (id: string): [ string | undefined, string | undefined ] =>
  id.startsWith('iiif:') ? id.substring('iiif:'.length).split(':') as [string, string] : [undefined, undefined];
