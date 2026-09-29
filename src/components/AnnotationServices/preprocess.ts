import imageCompression from 'browser-image-compression';
import { DynamicImageServiceResource } from 'cozy-iiif';
import { LoadedIIIFImage, LoadedImage } from '@/model';
import { PageTransform, Point, ProcessingState, Region, Rotation } from '@/services';
import { getImageSnippet } from '@/utils/getImageSnippet';
import { boundsToAnnotation } from '@/utils/getImageSnippetHelpers';
import { transformImage } from '@/utils/transformImage';

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

const transformPoint = (
  x: number, y: number,
  region: Region, // region in the ORIGINAL image 
  rotation: Rotation,
  isFlipped: boolean,
  w: number, h: number // dimensions of the submitted (cropped/rotated/flipped) image
): Point => {
  const deg = (((rotation ?? 0) % 360) + 360) % 360;

  if (isFlipped) x = w - x;

  let a: number, b: number, uw: number, uh: number;
  switch (deg) {
    case 0:   a = x;     b = y;     uw = w; uh = h; break;
    case 90:  a = y;     b = w - x; uw = h; uh = w; break;
    case 180: a = w - x; b = h - y; uw = w; uh = h; break;
    case 270: a = h - y; b = x;     uw = h; uh = w; break;
    default: throw new Error('Unsupported rotation: ' + rotation);
  }

  return {
    x: region.x + a * (region.w / uw),
    y: region.y + b * (region.h / uh)
  };
}

const toPageTransform = (
  region: Region,
  rotation: Rotation,
  isFlipped: boolean,
  w: number,
  h: number
): PageTransform => {
  const fn = (x: number, y: number) =>
    transformPoint(x, y, region, rotation, isFlipped, w, h);

  return ((input: Point | Region) => {
    if ('w' in input) {
      const tl = fn(input.x, input.y);
      const br = fn(input.x + input.w, input.y + input.h);
      const minX = Math.min(tl.x, br.x);
      const minY = Math.min(tl.y, br.y);
      return {
        x: minX,
        y: minY,
        w: Math.max(tl.x, br.x) - minX,
        h: Math.max(tl.y, br.y) - minY
      } as Region;
    }
    return fn(input.x, input.y);
  }) as PageTransform;
}

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
  rotation: Rotation,
  isFlipped: boolean, 
  onProgress: (state: ProcessingState) => void
): Promise<PreprocessingResult> => {
  const deg = (((rotation ?? 0) % 360) + 360) % 360 as Rotation;

  if (region) {
    onProgress('cropping');

    // Create a dummy annotation, so we can re-use 
    // the getImageSnippet function
    const annotation = boundsToAnnotation({
      minX: region.x,
      minY: region.y,
      maxX: region.x + region.w,
      maxY: region.y + region.h
    });

    const getRegionTransform = (w: number, h: number) =>
      toPageTransform(region, deg, isFlipped, w, h);
    
    if (isDynamicIIIF(image)) {
      const firstImage = (image as LoadedIIIFImage).canvas.images[0] as DynamicImageServiceResource;
      const regionURL = firstImage.getRegionURL(region, { degrees: deg, mirrored: isFlipped }, { minSize: Math.min(region.w, region.h)});

      /**
       * Case 1: Dynamic IIIF image service snippet with region
       */
      return fetch(regionURL).then(res => res.blob()).then(blob => {
        return getImageDimensions(blob).then(({ width, height }) => (
          { url: regionURL, transform: getRegionTransform(width, height) }
        ));
      });
    } else {
      return getImageSnippet(image, annotation, false).then(snippet => {
        if ('data' in snippet && 'file' in image) {
          const inputFile = deg === 0
            ? Promise.resolve(new File([new Blob([snippet.data as BlobPart])], image.name, { type: image.file.type }))
            : transformImage(new Blob([snippet.data as BlobPart]), deg, isFlipped, image.file.type).then(blob => {
              // window.open(URL.createObjectURL(blob), '_blank');
              return new File([blob], image.name, { type: image.file.type }) }
            );

          /**
           * Case 2: file image snippet (local or clipped static IIIF) with region
           */
          return inputFile.then(file => preprocessImageData(file, snippet.width, snippet.height, onProgress).then(result => (
            { file: result.file, transform: getRegionTransform(result.width, result.height) }
          )));
        } else {
          // Should never happen
          throw new Error('Unexpected snippet type');
        }
      });
    }
  } else {
    const getImageTransform = (origW: number, origH: number, w: number, h: number) =>
      toPageTransform({ x: 0, y: 0, w: origW, h: origH }, deg, isFlipped, w, h);

    if ('file' in image) {
      const inputFile = deg === 0
        ? Promise.resolve(image.file)
        : transformImage(image.file, rotation, isFlipped, image.file.type).then(blob => {
          return new File([blob], image.name, { type: image.file.type })
        });

      return inputFile.then(data => getImageDimensions(data).then(({ width, height }) => {
        const swap = deg === 90 || deg === 270;
        const origW = swap ? height : width;
        const origH = swap ? width : height;

        /**
         * Case 3: local image file without region
         */
        return preprocessImageData(data, width, height, onProgress).then(result => ({
          file: result.file, 
          transform: getImageTransform(origW, origH, result.width, result.height)
        }));
      }));
    } else {
      const firstImage = image.canvas.images[0];

      // Should never happen
      if (!firstImage) throw new Error('Canvas has no image');

      const imageURL = firstImage.getImageURL(1200, { degrees: deg, mirrored: isFlipped });

      onProgress('fetching_iiif');

      if (isDynamicIIIF(image)) {
        return firstImage.getPixelSize().then(originalSize => {
          return fetch(imageURL).then(res => res.blob()).then(blob => {
            return getImageDimensions(blob).then(({ width, height }) => {
              /**
               * Case 4a: IIIF image service without region
               */
              return { 
                url: imageURL, 
                transform: getImageTransform(originalSize.width, originalSize.height, width, height) };
            })
          });
        });
      } else {
        // Case 4b: Level0 or static image - need to fetch the whole image, than transform it in memory.
        return firstImage.getPixelSize()
          .then(originalSize => fetch(imageURL).then(res => res.blob()).then(blob => {
            const mimeType = blob.type || 'image/jpeg';
            const ext = mimeType.split('/')[1] ?? 'jpg';
            const name = `iiif-image.${ext}`;

            const inputFile = deg === 0
              ? Promise.resolve(new File([blob], name, { type: mimeType }))
              : transformImage(blob, deg, isFlipped, mimeType).then(transformed =>
                  new File([transformed], name, { type: mimeType })
                );

            return inputFile.then(file => 
              getImageDimensions(file).then(({ width, height }) =>
                preprocessImageData(file, width, height, onProgress).then(result => ({
                  file: result.file,
                  transform: getImageTransform(
                    originalSize.width, 
                    originalSize.height,
                    result.width, 
                    result.height
                  )
                }))
              )
            );
          }));
      }
    }
  }
}