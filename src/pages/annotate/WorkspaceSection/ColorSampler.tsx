import { useViewer } from '@annotorious/react';
import { CanvasClickEvent } from 'openseadragon';
import { useEffect } from 'react';

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

export const ColorSampler = () => {

  const viewer = useViewer();

  useEffect(() => {
    if (!viewer) return;

    const canvas = viewer.drawer.canvas as HTMLCanvasElement;

    const onCanvasClick = (event: CanvasClickEvent) => {
      const { x, y } = event.position;
      const pixel = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
      const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
      console.log(hex);
    }

    viewer.addHandler('canvas-click',  onCanvasClick);

    return () => {
      viewer.removeHandler('canvas-click', onCanvasClick);
    }
  }, [viewer]);

  return null;

}