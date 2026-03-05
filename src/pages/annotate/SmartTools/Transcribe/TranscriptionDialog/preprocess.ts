import { v4 as uuidv4 } from 'uuid';
import imageCompression from 'browser-image-compression';
import { DynamicImageServiceResource } from 'cozy-iiif';
import { ImageAnnotation, Rectangle, ShapeType } from '@annotorious/react';
import { LoadedIIIFImage, LoadedImage } from '@/model';
import { getImageSnippet } from '@/utils/getImageSnippet';
import { ProcessingState } from '../Types';
import { PageTransform, Point, Region } from '@/services';

interface IntermediateBasePreprocessingResult {

  width: number;

  height: number;

  kx: number;

  ky: number;

}

interface IntermediateFilePrepocessingResult extends IntermediateBasePreprocessingResult {

  file: File;

}

export interface FilePreprocessingResult {

  file: File;

  transform: PageTransform;

}

export interface IIIFPreprocessingResult {

  url: string;

  transform: PageTransform;

}

export type PreprocessingResult = FilePreprocessingResult | IIIFPreprocessingResult;

const getImageDimensions = (blob: Blob) => createImageBitmap(blob)
  .then(bitmap => {
    const { width, height } = bitmap;
    bitmap.close(); 
    return { width, height }
  });

const preprocessImageData = (
  file: File,
  width: number,
  height: number,
  onProgress: (state: ProcessingState) => void
): Promise<IntermediateFilePrepocessingResult> => {
  const compressionOpts = {
    maxSizeMB: 0.98,
    useWebWorker: true,
    libURL: '/browser-image-compression.js'
  };

  onProgress('compressing');

  return imageCompression(file, compressionOpts).then(compressed => {
    return getImageDimensions(compressed).then(compressedDimensions => {
      const kx = width / compressedDimensions.width;
      const ky = height / compressedDimensions.height;

      return {
        file: compressed,
        width: compressedDimensions.width,
        height: compressedDimensions.height,
        kx, 
        ky
      }
    });
  }).catch(error => {
    console.error(error);
    onProgress('compressing_failed');
    throw error;
  });
}

const isDynamicIIIF = (image: LoadedImage) => {
  if (!('canvas' in image)) return false;

  const firstImage = image.canvas.images[0];

  // Should never happen
  if (!firstImage) throw new Error('Canvas has no image');

  return firstImage.type === 'dynamic';
}

export const preprocess = (
  image: LoadedImage, 
  region: Region | undefined,
  onProgress: (state: ProcessingState) => void
): Promise<PreprocessingResult> => {
  if (region) {
    onProgress('cropping');

    // Create a dummy annotation, so we can re-use 
    // the getImageSnippet function
    const selector: Rectangle = {
      type: ShapeType.RECTANGLE,
      geometry: {
        bounds: {
          minX: region.x,
          minY: region.y,
          maxX: region.x + region.w,
          maxY: region.y + region.h
        },
        ...region
      }
    }

    const id = uuidv4();

    const annotation: ImageAnnotation = {
      id,
      bodies: [],
      target: {
        annotation: id,
        selector
      }
    };

    const getRegionTransform = (snippetWidth: number, snippetHeight: number) => ((input: Point | Region) => {
      const rotation = region.rotation ?? 0;
      const deg = ((rotation % 360) + 360) % 360;

      const transformPoint = (x: number, y: number): Point => {
        let ux: number;
        let uy: number;

        if (deg === 0 || deg === 180) {
          ux = x * (region.w / snippetWidth);
          uy = y * (region.h / snippetHeight);
        } else if (deg === 90 || deg === 270) {
          ux = x * (region.w / snippetHeight);
          uy = y * (region.h / snippetWidth);
        } else {
          throw new Error('Unsupported rotation:' + rotation);
        }

        return {
          x: ux + region.x,
          y: uy + region.y
        };
      };

      if ('w' in input) {
        const corners = [
          transformPoint(input.x, input.y),
          transformPoint(input.x + input.w, input.y),
          transformPoint(input.x, input.y + input.h),
          transformPoint(input.x + input.w, input.y + input.h)
        ];

        const xs = corners.map(p => p.x);
        const ys = corners.map(p => p.y);

        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);

        return { 
          x: minX, 
          y: minY, 
          w: maxX - minX, 
          h: maxY - minY 
        } as Region;
      } else {
        return transformPoint(input.x, input.y);
      }
    }) as PageTransform;
    
    if (isDynamicIIIF(image)) {
      const firstImage = (image as LoadedIIIFImage).canvas.images[0] as DynamicImageServiceResource;
      const regionURL = firstImage.getRegionURL(region, region.rotation, { minSize: Math.min(region.w, region.h)});

      /**
       * Case 1: Dynamic IIIF image service snippet with region
       */
      return fetch(regionURL).then(res => res.blob()).then(blob => {
        return getImageDimensions(blob).then(({ width, height }) => {
          return { url: regionURL, transform: getRegionTransform(width, height) };
        });
      });
    } else {
      return getImageSnippet(image, annotation, false).then(snippet => {
        if ('data' in snippet && 'file' in image) {
          const file = new File([new Blob([snippet.data as BlobPart])], image.name, { type: image.file.type });

          /**
           * Case 2: file image snippet (local or clipped static IIIF) with region
           */
          return preprocessImageData(file, snippet.width, snippet.height, onProgress).then(result => {
            return { file, transform: getRegionTransform(result.width, result.height) };
          });
        } else {
          // Should never happen
          throw new Error('Unexpected snippet type');
        }
      });
    }
  } else {
    const getImageTransform = (kx: number, ky: number) => ((input: Point | Region) => 'w' in input ? {
      x: input.x * kx,
      y: input.y * ky,
      w: input.w * kx,
      h: input.h * ky
    } : {
      x: input.x * kx,
      y: input.y * ky
    }) as PageTransform;

    if ('file' in image) {
      return getImageDimensions(image.data).then(({ width, height }) => {
        /**
         * Case 3: local image file without region
         */
        return preprocessImageData(image.file, width, height, onProgress).then(result => ({
          file: result.file, transform: getImageTransform(result.kx, result.ky)
        }));
      });
    } else {
      const firstImage = image.canvas.images[0];

      // Should never happen
      if (!firstImage) throw new Error('Canvas has no image');

      const imageURL = firstImage.getImageURL(1200);
      onProgress('fetching_iiif');

      return firstImage.getPixelSize().then(originalSize => {
        return fetch(imageURL).then(res => res.blob()).then(blob => {
          return getImageDimensions(blob).then(({ width, height }) => {
            const kx = originalSize.width / width;
            const ky = originalSize.height / height;

            /**
             * Case 4: IIIF image (service or static) without region
             */
            return { url: imageURL, transform: getImageTransform(kx, ky) };
          })
        });
      });
    }
  }
}