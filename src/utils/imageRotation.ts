import type { Point } from '@/services';

export const getRotatedImageSize = (width: number, height: number, rotation: number) => {
  const radians = rotation * Math.PI / 180;
  return {
    width: Math.abs(width * Math.cos(radians)) + Math.abs(height * Math.sin(radians)),
    height: Math.abs(width * Math.sin(radians)) + Math.abs(height * Math.cos(radians))
  };
}

export const imageToRotatedCoordinates = (
  point: Point,
  width: number,
  height: number,
  rotation: number,
  isFlipped: boolean
): Point => {
  const radians = rotation * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const rotated = getRotatedImageSize(width, height, rotation);
  const dx = point.x - width / 2;
  const dy = point.y - height / 2;
  let x = cos * dx - sin * dy + rotated.width / 2;
  const y = sin * dx + cos * dy + rotated.height / 2;

  if (isFlipped)
    x = rotated.width - x;

  return { x, y };
}

export const rotatedToImageCoordinates = (
  point: Point,
  width: number,
  height: number,
  rotation: number,
  isFlipped: boolean
): Point => {
  const radians = rotation * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const rotated = getRotatedImageSize(width, height, rotation);
  const x = isFlipped ? rotated.width - point.x : point.x;
  const dx = x - rotated.width / 2;
  const dy = point.y - rotated.height / 2;

  return {
    x: cos * dx + sin * dy + width / 2,
    y: -sin * dx + cos * dy + height / 2
  };
}
