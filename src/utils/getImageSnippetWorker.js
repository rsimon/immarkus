import { shouldApplyShapeMask, applyShapeMask } from './getImageSnippetHelpers';

self.onmessage = function(e) {
  const { blob, annotation, format, applyMask } = e.data;
  
  cropImage(blob, annotation, format, applyMask)
    .then(snippet => { 
      self.postMessage({ snippet });
      self.close();
    })
    .catch(error => self.postMessage({ error: error.message }));
}

function cropImage(
  blob, 
  annotation, 
  format = 'image/jpeg', 
  applyMask = false,
  maxWidth = 800,
  maxHeight = 800
) {
  if (format === 'image/jpeg' && applyMask)
    return new Promise.reject('Cannot apply mask to JPEG image');

  return new Promise((resolve, reject) => {
    const { bounds } = annotation.target.selector.geometry;

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    createImageBitmap(blob)
      .then(imageBitmap => {
        const canvas = new OffscreenCanvas(width, height);
        
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        context.drawImage(imageBitmap, bounds.minX, bounds.minY, width, height, 0, 0, width, height);

        if (applyMask && shouldApplyShapeMask(annotation))
          applyShapeMask(context, annotation);

        // Release memory (or at least try to...)
        imageBitmap.close();

        const scale = Math.min(maxWidth / width, maxHeight / height, 1);

        if (scale < 1) {
          console.debug(`Resizing image from ${width}x${height} to ${width * scale}x${height * scale}`);
          
          // If resizing is needed, create another canvas for the resized image
          const resizedCanvas = new OffscreenCanvas(width * scale, height * scale);
          const resizedContext = resizedCanvas.getContext('2d');

          if (!resizedContext) {
            reject(new Error('Failed to get resized canvas context'));
            return;
          }

          // Draw the cropped image onto the resized canvas
          resizedContext.drawImage(
            canvas, 
            0, 0, width, height, 
            0, 0, width * scale, height * scale
          );

          return resizedCanvas.convertToBlob({ type: format, quality: 0.9 });
        } else {
          return canvas.convertToBlob({ type: format, quality: 0.9 });
        }
      })
      .then(blob => {
        const reader = new FileReader();

        reader.onload = () => {
          const data = new Uint8Array(reader.result);

          resolve({
            annotation,
            height,
            width,
            data
          });

          // Might improve garbage collection...
          reader.onload = null;
        };

        reader.readAsArrayBuffer(blob);
      })
      .catch(error => reject(error));
  });
}

export {}; // Necessary for Vite to treat this as a module