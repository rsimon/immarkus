self.onmessage = function(e) {
  const { blob, annotation, format } = e.data;
  
  cropImage(blob, annotation, format)
    .then(snippet => { 
      self.postMessage({ snippet });
      self.close();
    })
    .catch(error => self.postMessage({ error: error.message }));
};

function cropImage(blob, annotation, format = 'image/jpeg', maxWidth = 800, maxHeight = 800, ) {
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

function applyPolygonMask(context, points, bounds) {
  // Will restore props like `globalCompositeOperation' later
  context.save();

  context.beginPath();

  points.forEach(([px, py], index) => {
    const x = px - bounds.minX;
    const y = py - bounds.minY;
    
    if (index === 0)
      context.moveTo(x, y);
    else
      context.lineTo(x, y);
  });

  context.closePath();
  
  // From the docs: The existing canvas content is kept where both the 
  // new shape and existing canvas content overlap. Everything else is 
  // made transparent.
  context.globalCompositeOperation = 'destination-in';
  context.fill();
  
  context.restore();
}

function applyEllipseMask(context, geometry, bounds) {
  context.save();

  const centerX = geometry.cx - bounds.minX;
  const centerY = geometry.cy - bounds.minY;
  
  context.beginPath();

  context.ellipse(
    centerX, 
    centerY, 
    geometry.rx, 
    geometry.ry, 
    0, 
    0, 
    2 * Math.PI
  );
  
  context.globalCompositeOperation = 'destination-in';
  context.fill();
  
  context.restore();
}

export {}; // Necessary for Vite to treat this as a module