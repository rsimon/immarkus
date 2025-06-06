import { v4 as uuidv4 } from 'uuid';
import { ImageAnnotation, ShapeType } from '@annotorious/react';

export const parseOCRSpaceResponse = (response: any, kx: number, ky: number) => 
  (response.ParsedResults as any[]).reduce<ImageAnnotation[]>((all, result) => {
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
                    minX: Left,
                    minY: Top,
                    maxX: Left + Width,
                    maxY: Top + Height
                  },
                  x: Left,
                  y: Top,
                  w: Width,
                  h: Height
                }
              }
            }
          }
        });

        return [...all, ...words];
      }, []);

      return [...all, ...onThisPage];
    }, []);