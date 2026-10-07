self.onmessage = function(e) {
  const { blob, rotation, flipped, format, crop } = e.data;
  
  transformImage(blob, rotation, flipped, format, crop)
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
  format = 'image/jpeg',
  crop
) {
  const rot = ((rotation % 360) + 360) % 360;

  if (rot === 0 && !flipped && !crop) return Promise.resolve(blob);

  const rad = rot * (Math.PI / 180);

  return createImageBitmap(blob).then(imageBitmap => {
    const { width, height } = imageBitmap;

    const rotatedWidth = Math.abs(width * Math.cos(rad)) + Math.abs(height * Math.sin(rad));
    const rotatedHeight = Math.abs(width * Math.sin(rad)) + Math.abs(height * Math.cos(rad));
    const outWidth = crop ? Math.ceil(crop.w) : Math.ceil(rotatedWidth);
    const outHeight = crop ? Math.ceil(crop.h) : Math.ceil(rotatedHeight);

    const canvas = new OffscreenCanvas(outWidth, outHeight);
    const context = canvas.getContext('2d');

    if (!context) throw new Error('Failed to get canvas context');

    if (crop) {
      context.translate(rotatedWidth / 2 - crop.x, rotatedHeight / 2 - crop.y);
    } else {
      context.translate(rotatedWidth / 2, rotatedHeight / 2);
    }
    if (flipped) context.scale(-1, 1);
    context.rotate(rad);
    context.drawImage(imageBitmap, -width / 2, -height / 2);

    imageBitmap.close();

    return canvas.convertToBlob({ type: format, quality: 0.9 });
  });
}

export {}; // Necessary for Vite to treat this as a module