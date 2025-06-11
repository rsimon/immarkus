import { v4 as uuidv4 } from 'uuid';
import { ImageAnnotation, ShapeType } from '@annotorious/react';

export const parseOCRSpaceResponse = (response: any, kx = 1, ky = 1) => 
  (response.ParsedResults as any[]).reduce<ImageAnnotation[]>((all, result) => {
    if ('TextOverlay' in result) {
      const onThisPage = (result.TextOverlay.Lines as any[]).reduce<ImageAnnotation[]>((all, line) => {
        const words = line.Words.map(({ WordText, Left, Top, Height, Width }) => {
          const id = uuidv4();

          return {
            id,
            bodies: [{
              annotation: id,
              purpose: 'commenting',
              value: WordText
            }],
            target: {
              annotation: id,
              selector: {
                type: ShapeType.RECTANGLE,
                geometry: {
                  bounds: {
                    minX: Left * kx,
                    minY: Top * ky,
                    maxX: (Left + Width) * kx,
                    maxY: (Top + Height) * ky
                  },
                  x: Left * kx,
                  y: Top * ky,
                  w: Width * kx,
                  h: Height * ky
                }
              }
            }
          }
        });

        return [...all, ...words];
      }, []);

      return [...all, ...onThisPage];
    } else {
      return all;
    }
  }, []);