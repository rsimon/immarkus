import { W3CAnnotation } from '@annotorious/react';
import { Download } from 'lucide-react';
import { Store, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Folder, Image, RootFolder } from '@/model';

export const exportAnnotations = (store: Store) => {

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
  }, Promise.resolve([]))

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

export const ExportAnnotations = () => {

  const store = useStore();

  return (
    <ul className="py-2">
      <li>
        <section className="w-full py-2 flex flex-row gap-20 justify-between">
          <div>
            <h3 className="font-medium mb-1">
              All Annotations
            </h3>

            <p className="text-sm">
              All annotations, on all images in your current work folder, as a flat list
              in <a className="underline underline-offset-4 hover:text-primary" href="https://www.w3.org/TR/annotation-model/" target="_blank">W3C Web Annotation format</a>.
            </p>
          </div>

          <div>
            <Button 
              className="whitespace-nowrap flex gap-2"
              onClick={() => exportAnnotations(store)}>
              <Download className="h-4 w-4" /> JSON-LD
            </Button>
          </div>
        </section>
      </li>
    </ul>
  )

}