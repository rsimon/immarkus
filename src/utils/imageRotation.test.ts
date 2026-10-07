import { describe, expect, it } from 'vitest';
import {
  getRotatedImageSize,
  imageToRotatedCoordinates,
  rotatedToImageCoordinates
} from './imageRotation';

describe('image rotation coordinates', () => {

  it('swaps the dimensions at a quarter turn', () => {
    expect(getRotatedImageSize(120, 80, 90).width).toBeCloseTo(80);
    expect(getRotatedImageSize(120, 80, 90).height).toBeCloseTo(120);
  });

  it.each([
    [23, false],
    [23, true],
    [90, false],
    [180, true],
    [271, false]
  ])('round-trips points at %i degrees (flipped: %s)', (rotation, isFlipped) => {
    const point = { x: 31.5, y: 57.25 };
    const rotated = imageToRotatedCoordinates(point, 120, 80, rotation, isFlipped);
    const original = rotatedToImageCoordinates(rotated, 120, 80, rotation, isFlipped);

    expect(original.x).toBeCloseTo(point.x);
    expect(original.y).toBeCloseTo(point.y);
  });

});
