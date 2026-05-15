import { LoadedImage } from '@/model';
import { ResolvedSearchResult } from './Types';

export const getBounds = (result: ResolvedSearchResult) => {
  if ('canvas' in result.image) {
    const { width, height} = result.image.canvas;
    const [ nx, ny, nw, nh ] = result.normalizedBounds;

    const x = nx * width;
    const y = ny * height;
    const w = nw * width;
    const h = nh * height;

    return [x, y, w, h];
  } else {
    return result.pxBounds;
  }
}