self.onmessage = function(e) {
  const { image, annotation } = e.data;
  
  cropImage(image, annotation)
    .then(snippet => self.postMessage({ snippet }))
    .catch(error => self.postMessage({ error: error.message }));
};

function cropImage(image, annotation) {
  return new Promise((resolve, reject) => {
    const { bounds } = annotation.target.selector.geometry;

    const width = bounds.maxX - bounds.minX;
    const height = bounds.maxY - bounds.minY;

    createImageBitmap(new Blob([image.data]))
      .then(imageBitmap => {
        const canvas = new OffscreenCanvas(width, height);
        
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        context.drawImage(imageBitmap, bounds.minX, bounds.minY, width, height, 0, 0, width, height);
        
        return canvas.convertToBlob({ type: 'image/png' });
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
        };

        reader.readAsArrayBuffer(blob);
      })
      .catch(error => reject(error));
  });
}

export {}; // Necessary for Vite to treat this as a module