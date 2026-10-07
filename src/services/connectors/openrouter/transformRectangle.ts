import type { PageTransform } from '@/services';

export const transformRectangle = (
  transform: PageTransform,
  rectangle: { x: number, y: number, w: number, h: number }
) => {
  const corners = [
    transform({ x: rectangle.x, y: rectangle.y }),
    transform({ x: rectangle.x + rectangle.w, y: rectangle.y }),
    transform({ x: rectangle.x + rectangle.w, y: rectangle.y + rectangle.h }),
    transform({ x: rectangle.x, y: rectangle.y + rectangle.h })
  ];
  const [topLeft, topRight, , bottomLeft] = corners;
  const center = {
    x: corners.reduce((sum, point) => sum + point.x, 0) / corners.length,
    y: corners.reduce((sum, point) => sum + point.y, 0) / corners.length
  };
  const w = Math.hypot(topRight.x - topLeft.x, topRight.y - topLeft.y);
  const h = Math.hypot(bottomLeft.x - topLeft.x, bottomLeft.y - topLeft.y);
  const rotation = Math.atan2(topRight.y - topLeft.y, topRight.x - topLeft.x);
  const xs = corners.map(point => point.x);
  const ys = corners.map(point => point.y);

  return {
    x: center.x - w / 2,
    y: center.y - h / 2,
    w,
    h,
    rot: rotation,
    bounds: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys)
    }
  };
}
