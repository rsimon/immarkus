import { W3CAnnotationBody, W3CImageAnnotation, W3CImageFormat } from '@annotorious/react';
import { Store } from '@/store';
import { FileImage, Folder, RootFolder } from '@/model';
import { getAnnotations, getFullPath } from '../utils';
import { shapeToCOCOGeometry } from './crosswalkGeometry';
import { COCOAnnotation, COCOCategory, COCODataset, COCOImage } from './types';

// Helper: determines width + height for the given image file blob
const getImageDimensions = (blob: Blob): Promise<{ width: number, height: number }> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });

const getImagesRecursive = (folder: RootFolder | Folder, store: Store, all: FileImage[] = []): FileImage[] => {
  const { images, folders } = store.getFolderContents(folder.handle);
  const updated = [...all, ...images];
  return folders.reduce((acc, subfolder) => getImagesRecursive(subfolder, store, acc), updated);
}

const isClassification = (body: W3CAnnotationBody): body is W3CAnnotationBody & { source: string } =>
  body?.purpose === 'classifying' && Boolean(body.source);

/**
 * Exports all annotations on file-based images in the current work folder as a COCO
 * "instances" dataset (https://cocodataset.org/#format-data). Only annotations classified
 * with an Entity Class are included - unclassified (note-only) annotations are skipped, since
 * COCO annotations require a category. LINE and POLYLINE shapes are skipped too, since COCO
 * has no representation for open paths.
 *
 * The result is a single JSON file. `file_name` in the `images` list is the path of each
 * image relative to the work folder - this export does not bundle image files.
 */
export const exportAnnotationsAsCOCO = (store: Store, onProgress?: (progress: number) => void): Promise<void> => {
  const images = getImagesRecursive(store.getRootFolder(), store);

  const progressIncrement = 100 / (images.length + 1);
  let progress = 0;

  const updateProgress = () => {
    progress += progressIncrement;
    onProgress?.(Math.min(progress, 100));
  }

  updateProgress();

  // Entity Type ID -> COCO category ID, in first-encountered order
  const categoryIds = new Map<string, number>();

  const getCategoryId = (entityTypeId: string): number => {
    if (!categoryIds.has(entityTypeId))
      categoryIds.set(entityTypeId, categoryIds.size + 1);
    return categoryIds.get(entityTypeId)!;
  }

  let nextAnnotationId = 1;

  const promise = images.reduce<Promise<{ images: COCOImage[], annotations: COCOAnnotation[] }>>((chain, image, idx) => {
    const imageId = idx + 1;

    return chain.then(async ({ images: allImages, annotations: allAnnotations }) => {
      const path = getFullPath(image, store, []);
      const fileName = [...path, image.name].join('/');

      let dimensions = { width: 0, height: 0 };

      try {
        const loaded = await store.loadImage(image.id);
        dimensions = await getImageDimensions(loaded.data);
      } catch (error) {
        console.warn(`COCO export: failed to read image dimensions for ${fileName}`, error);
      }

      const cocoImage: COCOImage = {
        id: imageId,
        file_name: fileName,
        width: dimensions.width,
        height: dimensions.height
      };

      const annotations = await getAnnotations(image, store);

      const adapter = W3CImageFormat(image.name);

      const newAnnotations = annotations.reduce<COCOAnnotation[]>((acc, annotation) => {
        const { parsed } = adapter.parse(annotation as W3CImageAnnotation);
        if (!parsed) return acc;

        const geometry = shapeToCOCOGeometry(parsed.target.selector);
        if (!geometry) return acc;

        const bodies = (Array.isArray(annotation.body) ? annotation.body : [annotation.body])
          .filter(isClassification);

        const newEntries: COCOAnnotation[] = bodies.map(body => ({
          id: nextAnnotationId++,
          image_id: imageId,
          category_id: getCategoryId(body.source),
          bbox: geometry.bbox,
          segmentation: geometry.segmentation,
          area: geometry.area,
          iscrowd: 0
        }));

        return [...acc, ...newEntries];
      }, []);

      updateProgress();

      return {
        images: [...allImages, cocoImage],
        annotations: [...allAnnotations, ...newAnnotations]
      };
    });
  }, Promise.resolve({ images: [], annotations: [] }));

  return promise.then(({ images: cocoImages, annotations: cocoAnnotations }) => {
    const model = store.getDataModel();

    const categories: COCOCategory[] = [...categoryIds.entries()].map(([entityTypeId, id]) => {
      const type = model.getEntityType(entityTypeId);
      const name = type?.label || type?.id || entityTypeId;

      const ancestors = type ? model.getAncestors(type) : [];
      const supercategory = ancestors.length > 0 ? (ancestors[0].label || ancestors[0].id) : name;

      return { id, name, supercategory };
    });

    const dataset: COCODataset = {
      info: {
        description: 'Exported from IMMARKUS',
        version: process.env.PACKAGE_VERSION,
        year: new Date().getFullYear(),
        date_created: new Date().toISOString()
      },
      images: cocoImages,
      categories,
      annotations: cocoAnnotations
    };

    const str = JSON.stringify(dataset);
    const data = new TextEncoder().encode(str);
    const blob = new Blob([data], {
      type: 'application/json;charset=utf-8'
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = 'instances.json';
    anchor.click();

    onProgress?.(100);
  });
}
