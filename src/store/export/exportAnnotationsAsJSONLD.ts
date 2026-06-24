import { Store } from '@/store';
import { getAnnotations } from './utils';
import { 
  CanvasInformation, 
  Folder, 
  IIIFManifestResource, 
  Image, RootFolder 
} from '@/model';

export const exportAnnotationsAsJSONLD = (store: Store) => {

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
  const annotations = getAnnotations(images, store);

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