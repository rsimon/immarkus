import imageCompression from 'browser-image-compression';
import type { DynamicImageServiceResource } from 'cozy-iiif';
import { LoadedIIIFImage, LoadedImage } from '@/model';
import { PageTransform, Point, ProcessingState, Region, Rotation } from '@/services';
import { transformImage } from '@/utils/transformImage';
import { getRotatedImageSize, rotatedToImageCoordinates } from '@/utils/imageRotation';

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

const toPageTransform = (
  originalWidth: number,
  originalHeight: number,
  rotation: Rotation,
  isFlipped: boolean,
  region: Region | undefined,
  submittedWidth: number,
  submittedHeight: number
): PageTransform => {
  const oriented = getRotatedImageSize(originalWidth, originalHeight, rotation);

  const fn = (input: Point): Point => {
    let x = region
      ? region.x + input.x * (region.w / submittedWidth)
      : input.x * (oriented.width / submittedWidth);
    let y = region
      ? region.y + input.y * (region.h / submittedHeight)
      : input.y * (oriented.height / submittedHeight);

    return rotatedToImageCoordinates(
      { x, y },
      originalWidth,
      originalHeight,
      rotation,
      isFlipped
    );
  }

  const transform = (input: Point | Region) => {
    if ('w' in input) {
      const corners = [
        fn({ x: input.x, y: input.y }),
        fn({ x: input.x + input.w, y: input.y }),
        fn({ x: input.x, y: input.y + input.h }),
        fn({ x: input.x + input.w, y: input.y + input.h })
      ];
      const xs = corners.map(p => p.x);
      const ys = corners.map(p => p.y);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      return {
        x: minX,
        y: minY,
        w: Math.max(...xs) - minX,
        h: Math.max(...ys) - minY
      };
    }
    return fn(input);
  }

  return Object.assign(transform, {
    source: { width: submittedWidth, height: submittedHeight }
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

const fetchBlob = (url: string) => fetch(url).then(response => {
  if (import.meta.env.DEV)
    console.info('Fetching IIIF image URL:', url);

  if (!response.ok)
    throw new Error(`Failed to fetch image (${response.status} ${response.statusText})`);
  return response.blob();
});

const getIIIFSource = (image: LoadedIIIFImage, minSize?: number) => {
  const firstImage = image.canvas.images[0];
  if (!firstImage) throw new Error('Canvas has no image');

  return firstImage.getPixelSize().then(originalSize => {
    const url = firstImage.type === 'static'
      ? firstImage.url
      : firstImage.getImageURL(minSize ?? Math.max(originalSize.width, originalSize.height));
    return fetchBlob(url).then(blob => ({ blob, originalSize }));
  });
}

export const preprocess = (
  image: LoadedImage, 
  region: Region | undefined,
  rotation: Rotation,
  isFlipped: boolean, 
  onProgress: (state: ProcessingState) => void
): Promise<PreprocessingResult> => {
  const deg = (((rotation ?? 0) % 360) + 360) % 360 as Rotation;
  const getSource = (minSize?: number) => 'file' in image
    ? getImageDimensions(image.file).then(originalSize => ({
        blob: image.file,
        originalSize
      }))
    : getIIIFSource(image, minSize);

  const preprocessFile = (
    blob: Blob,
    originalWidth: number,
    originalHeight: number,
    crop?: Region
  ): Promise<FilePreprocessingResult> => {
    const mimeType = blob.type || ('file' in image ? image.file.type : 'image/jpeg');
    const originalOriented = getRotatedImageSize(originalWidth, originalHeight, deg);

    return getImageDimensions(blob).then(({ width, height }) => {
      const blobOriented = getRotatedImageSize(width, height, deg);
      const scaledCrop = crop && {
        ...crop,
        x: crop.x * blobOriented.width / originalOriented.width,
        y: crop.y * blobOriented.height / originalOriented.height,
        w: crop.w * blobOriented.width / originalOriented.width,
        h: crop.h * blobOriented.height / originalOriented.height
      };

      return transformImage(blob, deg, isFlipped, mimeType, scaledCrop).then(transformed =>
        getImageDimensions(transformed).then(({ width: transformedWidth, height: transformedHeight }) => {
          const extension = mimeType.split('/')[1] || 'jpg';
          const name = 'file' in image ? image.name : `iiif-image.${extension}`;
          const file = new File([transformed], name, { type: mimeType });

          return preprocessImageData(file, transformedWidth, transformedHeight, onProgress).then(result => ({
            file: result.file,
            transform: toPageTransform(
              originalWidth,
              originalHeight,
              deg,
              isFlipped,
              crop,
              result.width,
              result.height
            )
          }));
        })
      );
    });
  };

  if (region) {
    onProgress('cropping');
    return getSource(1200).then(({ blob, originalSize }) =>
      preprocessFile(blob, originalSize.width, originalSize.height, region)
    );
  }

  if ('canvas' in image && isDynamicIIIF(image)) {
    const firstImage = image.canvas.images[0] as DynamicImageServiceResource;
    const imageURL = firstImage.getImageURL(1200, { degrees: deg, mirrored: isFlipped });
    onProgress('fetching_iiif');

    return firstImage.getPixelSize().then(originalSize =>
      fetchBlob(imageURL).then(blob =>
        getImageDimensions(blob).then(({ width, height }) => ({
          url: imageURL,
          transform: toPageTransform(
            originalSize.width,
            originalSize.height,
            deg,
            isFlipped,
            undefined,
            width,
            height
          )
        }))
      )
    );
  }

  if ('canvas' in image)
    onProgress('fetching_iiif');

  return getSource().then(({ blob, originalSize }) =>
    preprocessFile(blob, originalSize.width, originalSize.height)
  );
}