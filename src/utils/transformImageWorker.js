self.onmessage = function(e) {
  const { blob, rotation, flipped, format } = e.data;
  
  transformImage(blob, rotation, flipped, format)
    .then(blob => { 
      self.postMessage({ blob });  
      self.close();
    })
    .catch(error => self.postMessage({ error: error.message }));
}

function transformImage(
  blob,
  rotation,
  flipped = false,
  format = 'image/jpeg'
) {
  const rot = ((rotation % 360) + 360) % 360;

  if (rot === 0 && !flipped) return Promise.resolve(blob);

  const rad = rot * (Math.PI / 180);
  const isTransposed = rotation % 180 !== 0;

  return createImageBitmap(blob).then(imageBitmap => {
    const { width, height } = imageBitmap;

    const outWidth  = isTransposed ? height : width;
    const outHeight = isTransposed ? width : height;

    const canvas = new OffscreenCanvas(outWidth, outHeight);
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Failed to get canvas context');

    context.translate(outWidth / 2, outHeight / 2);
    context.rotate(rad);
    if (flipped) context.scale(-1, 1);
    context.drawImage(imageBitmap, -width / 2, -height / 2);

    imageBitmap.close();

    return canvas.convertToBlob({ type: format, quality: 0.9 });
  });
}

export {}; // Necessary for Vite to treat this as a module