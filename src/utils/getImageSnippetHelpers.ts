import { approximateAsPolygon, ShapeType } from '@annotorious/annotorious';
import type { 
  Bounds,
  EllipseGeometry, 
  ImageAnnotation, 
  MultiPolygonGeometry, 
  PolygonGeometry, 
  PolylineGeometry
} from '@annotorious/annotorious';

const detectImageFormat = (uint8Array: Uint8Array<ArrayBuffer>) => {
  const header = uint8Array.slice(0, 4);
  
  if (header[0] === 0xFF && header[1] === 0xD8) return 'image/jpeg';
  if (header[0] === 0x89 && header[1] === 0x50) return 'image/png';
  if (header[0] === 0x47 && header[1] === 0x49) return 'image/gif';
  if (header[0] === 0x52 && header[1] === 0x49) return 'image/webp';
  
  return 'image/jpeg';
}

// Shorthand
export const shouldApplyShapeMask = (annotation: ImageAnnotation) => {
  const { selector } = annotation.target;
  const { type } = selector;

  return  type === ShapeType.ELLIPSE 
    || type === ShapeType.MULTIPOLYGON 
    || type === ShapeType.POLYGON
    || (type === ShapeType.POLYLINE && (selector.geometry as PolylineGeometry).closed);
}

export const applyShapeMask = (
  context: OffscreenCanvasRenderingContext2D, 
  annotation: ImageAnnotation,
  kx = 1, 
  ky = 1
) => {
  const { selector } = annotation.target;
  
  if (selector.type === ShapeType.ELLIPSE)
    applyEllipseMask(context, selector.geometry as EllipseGeometry, kx, ky);  
  else if (selector.type === ShapeType.MULTIPOLYGON)
    applyMultiPolygonMask(context, selector.geometry as MultiPolygonGeometry, kx, ky);
  else if (selector.type === ShapeType.POLYGON)
    applyPolygonMask(context, selector.geometry as PolygonGeometry, kx, ky);
  else if (selector.type === ShapeType.POLYLINE)
    applyClosedPolylineMask(context, selector.geometry as PolylineGeometry, kx, ky);
}

export const applyMaskToUint8Array = (
  uint8Array: Uint8Array<ArrayBuffer>, 
  annotation: ImageAnnotation
): Promise<Uint8Array<ArrayBuffer>> => {
  if (!shouldApplyShapeMask(annotation))
    return Promise.resolve(uint8Array);

  const format = detectImageFormat(uint8Array);
  const blob = new Blob([uint8Array], { type: format });
  
  return createImageBitmap(blob).then(bitmap => {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const context = canvas.getContext('2d');
  
    if (!context)
      throw new Error('Failed to get canvas context');
  
    context.drawImage(bitmap, 0, 0);

    // Scale factor between original annotation coordinate space
    // and (possibly down-scaled) image bitmap
    const { bounds } = annotation.target.selector.geometry;
    
    const kx = bitmap.width / (bounds.maxX - bounds.minX);
    const ky = bitmap.height / (bounds.maxY - bounds.minY);

    applyShapeMask(context, annotation, kx, ky);

    bitmap.close();

    return canvas.convertToBlob({ type: 'image/png' }).then(blob => {
      return blob.arrayBuffer().then(buffer => new Uint8Array(buffer));
    })
  });
}

const applyMaskToPolygonLike = (
  context: OffscreenCanvasRenderingContext2D,
  bounds: Bounds,
  points: number[][],
  kx = 1,
  ky = 1
) => {
    // Will allow us to restore props like `globalCompositeOperation' later
  context.save();

  context.beginPath();

  points.forEach(([px, py], index) => {
    const x = (px - bounds.minX) * kx;
    const y = (py - bounds.minY) * ky;
    
    if (index === 0)
      context.moveTo(x, y);
    else
      context.lineTo(x, y);
  });

  context.closePath();

  // From the docs on 'destination-in': "The existing canvas content is kept 
  // where both the new shape and existing canvas content overlap. Everything 
  // else is made transparent."
  context.globalCompositeOperation = 'destination-in';
  context.fill();
  
  context.restore();
}

const applyPolygonMask = (
  context: OffscreenCanvasRenderingContext2D, 
  geometry: PolygonGeometry,
  kx = 1,
  ky = 1 
) => {
  const { bounds, points } = geometry;
  return applyMaskToPolygonLike(context, bounds, points, kx, ky);
}

const applyClosedPolylineMask = (
  context: OffscreenCanvasRenderingContext2D, 
  geometry: PolylineGeometry,
  kx = 1,
  ky = 1 
) => {
  const points = approximateAsPolygon(geometry.points, true);
  return applyMaskToPolygonLike(context, geometry.bounds, points, kx, ky);
}

const applyEllipseMask = (
  context: OffscreenCanvasRenderingContext2D,  
  geometry: EllipseGeometry,
  kx = 1,
  ky = 1 
) => {
  context.save();

  const centerX = (geometry.cx - geometry.bounds.minX) * kx;
  const centerY = (geometry.cy - geometry.bounds.minY) * ky;
  
  context.beginPath();

  context.ellipse(
    centerX, 
    centerY, 
    geometry.rx * kx, 
    geometry.ry * ky, 
    0, 
    0, 
    2 * Math.PI
  );
  
  context.globalCompositeOperation = 'destination-in';
  context.fill();
  
  context.restore();
}

const applyMultiPolygonMask = (
  context: OffscreenCanvasRenderingContext2D,  
  geometry: MultiPolygonGeometry,
  kx = 1,
  ky = 1
) => {
  context.save();

  context.beginPath();

  const { bounds, polygons } = geometry;

  // Draw all rings from all polygons into a single path
  polygons.forEach(polygon => {
    polygon.rings.forEach(ring => {
      ring.points.forEach(([px, py], index) => {
        const x = (px - bounds.minX) * kx;
        const y = (py - bounds.minY) * ky;
        
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      });
      // Close each ring
      context.closePath();
    });
  });

  // Use evenodd fill rule - this automatically handles holes!
  // Areas covered by an odd number of paths are filled,
  // areas covered by an even number are not filled
  context.globalCompositeOperation = 'destination-in';
  context.fill('evenodd');
  
  context.restore();
}