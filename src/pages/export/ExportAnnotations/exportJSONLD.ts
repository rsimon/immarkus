import { W3CAnnotation } from '@annotorious/react';
import { Folder, Image, RootFolder } from '@/model';
import { Store } from '@/store';

export const exportAnnotationsAsJSONLD = (store: Store) => {

  const getImagesRecursive = (folder: RootFolder | Folder, allImages: Image[] = []): Image[] => {
    const { images, folders } = store.getFolderContents(folder.handle);

    const updatedImages = [...allImages, ...images];

    return folders.reduce((all, subfolder) => getImagesRecursive(subfolder, all), updatedImages);
  }

  const images = getImagesRecursive(store.getRootFolder());

  const annotations = images.reduce<Promise<W3CAnnotation[]>>((promise, image) => {
    return promise.then((all) => {
      return store.getAnnotations(image.id).then(annotations => {
        return [...all, ...annotations]
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