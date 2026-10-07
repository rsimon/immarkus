import { describe, expect, it } from 'vitest';
import type { PageTransform } from '@/services';
import { transformRectangle } from './transformRectangle';

const rotateTransform = (radians: number): PageTransform => {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const transform = (point: { x: number, y: number }) => ({
    x: 50 + cos * (point.x - 50) - sin * (point.y - 50),
    y: 50 + sin * (point.x - 50) + cos * (point.y - 50)
  });

  return Object.assign(transform, { source: { width: 100, height: 100 } }) as PageTransform;
};

describe('OpenRouter annotation rectangle mapping', () => {

  it('preserves rotation from the submitted image and computes outer bounds', () => {
    const angle = -Math.PI / 6;
    const geometry = transformRectangle(rotateTransform(angle), {
      x: 20,
      y: 30,
      w: 30,
      h: 30
    });

    expect(geometry.w).toBeCloseTo(30);
    expect(geometry.h).toBeCloseTo(30);
    expect(geometry.rot).toBeCloseTo(angle);
    expect(geometry.bounds.minX).toBeCloseTo(14.0192378865);
    expect(geometry.bounds.minY).toBeCloseTo(32.6794919243);
    expect(geometry.bounds.maxX).toBeCloseTo(55);
    expect(geometry.bounds.maxY).toBeCloseTo(73.6602540378);
  });

  it('keeps service boxes axis-aligned when the image transform is unrotated', () => {
    const geometry = transformRectangle(rotateTransform(0), {
      x: 20,
      y: 30,
      w: 30,
      h: 30
    });

    expect(geometry.rot).toBeCloseTo(0);
  });

});
