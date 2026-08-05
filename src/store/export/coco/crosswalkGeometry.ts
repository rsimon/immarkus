import { computeArea, Ellipse, MultiPolygon, Polygon, Rectangle, Shape, ShapeType } from '@annotorious/annotorious';

/** Corners of a (possibly rotated) rectangle, in image pixel coordinates. Rotation is in radians, around the rectangle center. **/
const getRectangleCorners = (x: number, y: number, w: number, h: number, rot = 0): [number, number][] => {
  if (!rot)
    return [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  const cx = x + w / 2;
  const cy = y + h / 2;

  const cos = Math.cos(rot);
  const sin = Math.sin(rot);

  const local: [number, number][] = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]];

  return local.map(([dx, dy]) => [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos]);
}

/** Polygon approximation of an ellipse, sampled at the given number of points. **/
const getEllipsePoints = (cx: number, cy: number, rx: number, ry: number, samples = 32): [number, number][] =>
  Array.from({ length: samples }, (_, i) => {
    const angle = (2 * Math.PI * i) / samples;
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  });

export interface COCOGeometry {

  bbox: [number, number, number, number];

  segmentation: number[][];

  area: number;

}

/**
 * Crosswalks an Annotorious shape into COCO bbox / segmentation / area.
 *
 * Returns undefined for shape types that have no closed region (LINE, POLYLINE),
 * since COCO's `instances` format has no representation for open paths.
 */
export const shapeToCOCOGeometry = (shape: Shape): COCOGeometry | undefined => {
  const { bounds } = shape.geometry;
  const bbox: [number, number, number, number] = [
    bounds.minX,
    bounds.minY,
    bounds.maxX - bounds.minX,
    bounds.maxY - bounds.minY
  ];

  if (shape.type === ShapeType.RECTANGLE) {
    const { x, y, w, h, rot } = (shape as Rectangle).geometry;
    const corners = getRectangleCorners(x, y, w, h, rot);
    return { bbox, segmentation: [corners.flat()], area: w * h };
  } else if (shape.type === ShapeType.POLYGON) {
    const { points } = (shape as Polygon).geometry;
    return { bbox, segmentation: [points.flat()], area: computeArea(shape) };
  } else if (shape.type === ShapeType.ELLIPSE) {
    const { cx, cy, rx, ry } = (shape as Ellipse).geometry;
    return { bbox, segmentation: [getEllipsePoints(cx, cy, rx, ry).flat()], area: computeArea(shape) };
  } else if (shape.type === ShapeType.MULTIPOLYGON) {
    const { polygons } = (shape as MultiPolygon).geometry;
    const segmentation = polygons.flatMap(p => p.rings.map(r => r.points.flat())).filter(pts => pts.length >= 6);
    if (segmentation.length === 0) return undefined;
    return { bbox, segmentation, area: computeArea(shape) };
  } else {
    // LINE, POLYLINE - no closed region, not representable in COCO
    return undefined;
  }
}
