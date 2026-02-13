import { W3CAnnotation } from '@annotorious/react';
import { Store } from '@/store';
import { 
  CanvasInformation, 
  Folder, 
  IIIFManifestResource, 
  Image, RootFolder 
} from '@/model';

export const exportAnnotationsAsJSONLD = (store: Store) => {

  const crosswalkIIIFTarget = (annotation: W3CAnnotation, imageId: string): W3CAnnotation => {
    if (!Array.isArray(annotation.target) && typeof annotation.target !== 'string') {
      const canvas = store.getCanvas(imageId);
      
      // Should never happen
      if (!canvas) return annotation;

      return {
        ...annotation,
        target: {
          ...annotation.target,
          source: canvas.uri
        }
      };
    } else {
      // Type safety protection - should never happen
      return annotation;
    }
  }

  const getImagesRecursive = (folder: RootFolder | Folder, allImages: (Image | CanvasInformation)[] = []): Image[] => {
    const { images, folders, iiifResources } = store.getFolderContents(folder.handle);

    const canvases = iiifResources.reduce((all, manifest) => ([
        ...all, 
        ...(manifest as IIIFManifestResource).canvases
      ]), [])

    const updatedImages = [...allImages, ...images, ...canvases];

    return folders.reduce((all, subfolder) => getImagesRecursive(subfolder, all), updatedImages);
  }

  const images = getImagesRecursive(store.getRootFolder());

  const annotations = images.reduce<Promise<W3CAnnotation[]>>((promise, image) => {
    return promise.then((all) => {
      const isManifest = 'manifestId' in image;
      const id = isManifest ? `iiif:${image.manifestId}:${image.id}` : image.id;

      return store.getAnnotations(id).then(annotations => {
        return isManifest ? (
          // Replace IMMARKUS internal ID with Canvas URI
          [...all, ...annotations.map(a => crosswalkIIIFTarget(a, id))]
        ) : (
          [...all, ...annotations]
        );
      })
    })
  }, Promise.resolve([]));

  annotations.then(annotations => {
    const str = JSON.stringify(annotations);
    const data = new TextEncoder().encode(str);
    const blob = new Blob([data], {
      type: 'application/json;charset=utf-8'
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'annotations.json';
    anchor.click();
  });

}