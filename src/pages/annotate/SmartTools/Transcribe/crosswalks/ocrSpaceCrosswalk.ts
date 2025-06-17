import { v4 as uuidv4 } from 'uuid';
import { ImageAnnotation, ShapeType } from '@annotorious/react';
import { PageTransform } from '../Types';

export const parseOCRSpaceResponse = (response: any, transform: PageTransform) => 
  (response.ParsedResults as any[]).reduce<ImageAnnotation[]>((all, result) => {
    if ('TextOverlay' in result) {
      const onThisPage = (result.TextOverlay.Lines as any[]).reduce<ImageAnnotation[]>((all, line) => {
        const words = line.Words.map(({ WordText, Left, Top, Height, Width }) => {
          const id = uuidv4();

          const rect = transform({ x: Left, y: Top, w: Width, h: Height });

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
                    minX: rect.x,
                    minY: rect.y,
                    maxX: rect.x + rect.w,
                    maxY: rect.y + rect.h
                  },
                  ...rect
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