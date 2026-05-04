import murmur from 'murmurhash';
import { W3CAnnotation } from '@annotorious/react';
import { Cozy } from 'cozy-iiif';
import { IIIFManifestResource, IIIFResourceInformation } from '@/model';
import { useStore } from '@/store';
import { generateShortId } from '@/store/utils';
import { getCanvasLabelWithFallback } from '../../utils/iiif';

export const useFixRelocatedManifest = () => {
  const store = useStore();

  const fixRelocatedManifest = (
    manifest: IIIFManifestResource, 
    newUrl: string
  ) => {
    const folder = manifest.path[manifest.path.length - 1];
    console.log('Downloading manifest...');

    const idSeed = folder ? `${folder}/${manifest.uri}` : manifest.uri;
    generateShortId(idSeed).then(id  => {
      Cozy.parseURL(newUrl)
        .then(result => {
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

          // console.log('Previous ID was: ' + manifest.id);
          // console.log('New manifest ID is: ' + id);

          const p = manifest.canvases.reduce<Promise<Record<string, W3CAnnotation[]>>>((p, canvas, idx) => p.then(all => {
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

          p.then(mappedAnnotations => {
            console.log('Importing new manifest');
            return store.importIIIFResource(info, folder).then(() => {
              console.log(`Transferring ${Object.values(mappedAnnotations).reduce<number>((a, b) => a + b.length, 0)} annotations`);
              console.log(mappedAnnotations);
              return Object.entries(mappedAnnotations).reduce<Promise<void>>((p, [imageId, annotations]) => p.then(() => {
                return annotations.length > 0 ? store.bulkUpsertAnnotation(imageId, annotations) : Promise.resolve();
              }), Promise.resolve());
            })
          }).then(() => {
            console.log('Removing outdated manifest');
            store.removeIIIFResource(manifest).then(() => console.log('Done.'));
          });
        })
        .catch(error => {
          console.error(error);
        });
    })

    console.log('repairing', manifest, newUrl);
  }

  return { fixRelocatedManifest };

}
