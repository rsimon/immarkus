import murmur from 'murmurhash';
import { W3CAnnotation } from '@annotorious/react';
import { Cozy } from 'cozy-iiif';
import { IIIFManifestResource, IIIFResourceInformation } from '@/model';
import { useStore } from '@/store';
import { generateShortId } from '@/store/utils';
import { getCanvasLabelWithFallback } from '../../utils/iiif';

export const useFixRelocatedManifest = () => {
  const store = useStore();

  const fixRelocatedManifest = async (
    manifest: IIIFManifestResource, 
    newUrl: string
  ) => {
    const folder = manifest.path[manifest.path.length - 1];
    console.log('Downloading manifest...');

    const idSeed = folder ? `${folder}/${manifest.uri}` : manifest.uri;
    const id = await generateShortId(idSeed);

    const result = await  Cozy.parseURL(newUrl);
    if (result.type !== 'manifest')
      throw new Error('Not a manifest');

    const newManifest = result.resource;

    const info: IIIFResourceInformation = {
      id,
      name: newManifest.getLabel() || `IIIF Presentation API v${newManifest.majorVersion}`,
      uri: newUrl,
      importedAt: manifest.importedAt,
      type: 'PRESENTATION_MANIFEST',
      majorVersion: newManifest.majorVersion,
      canvases: newManifest.canvases.map(canvas => ({
        id: murmur.v3(canvas.id).toString(),
        uri: canvas.id,
        name: getCanvasLabelWithFallback(canvas),
        manifestId: id
      }))
    }

    const mappedMeta = await store.getAnnotations(`iiif:${manifest.id}`, { type: 'metadata' }).then(annotations => {
      const meta = annotations.filter(a => (a.target as any).source === `iiif:${manifest.id}`);
      return meta.map(a => ({
        ...a,
        target: {
          // @ts-ignore
          ...a.target,
          source: `iiif:${id}`
        }
      }))
    });

    const mappedAnnotations = await manifest.canvases.reduce<Promise<Record<string, W3CAnnotation[]>>>((p, canvas, idx) => p.then(all => {
      const oldId = `iiif:${manifest.id}:${canvas.id}`;
      const newId = `iiif:${id}:${info.canvases[idx].id}`;

      return store.getAnnotations(oldId).then(onThisCanvas => {
        const mapped = onThisCanvas.map(a => ({
          ...a, 
          target: {
            // @ts-ignore
            ...a.target,
            source: newId
          }
        }));
        return {...all, [newId]: mapped };
      });
    }), Promise.resolve({}));

    console.log('Importing new manifest');

    await store.importIIIFResource(info, folder);

    console.log('Transferring annotations');  
    const canvasAnnotations = Object.values(mappedAnnotations).flat();
    const merged = [...mappedMeta, ...canvasAnnotations];

    console.log(merged);
    await store.bulkUpsertAnnotation(`iiif:${id}`, merged);

    console.log('Removing outdated manifest');
    await store.removeIIIFResource(manifest).then(() => console.log('Done.'));
  }

  return { fixRelocatedManifest };

}
