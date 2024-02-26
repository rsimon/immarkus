import {  W3CImageAnnotation } from '@annotorious/react';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { Store } from '@/store';
import { Image } from '@/model';
import { Snippet, getImageSnippet } from './getImageSnippet';

interface AnnotationWithSnippet {

  annotation: W3CImageAnnotation;

  image: Image;

  snippet: Snippet;

}

const getAnnotations = (image: Image, store: Store): Promise<AnnotationWithSnippet[]> =>
  store.loadImage(image.id).then(loaded =>
    store.getAnnotations(image.id).then(annotations => 
      Promise.all(annotations.map(a => {
        const annotation = a as W3CImageAnnotation;
        return getImageSnippet(loaded, annotation).then(snippet => (
          { annotation, image, snippet }
        ))
      }))
    )
  );

export const exportAnnotationsAsExcel = (store: Store) => {
  const { images } = store;

  const annotations = images.reduce<Promise<AnnotationWithSnippet[]>>((promise, image) => promise.then(all =>
    getAnnotations(image, store).then(annotations => ([...all, ...annotations]))
  ), Promise.resolve([]));

  annotations.then(annotations => {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'IMMARKUS';
    workbook.lastModifiedBy = 'IMMARKUS';
    workbook.created = new Date();
    workbook.modified = new Date();
  
    const worksheet = workbook.addWorksheet('Annotations');
    
    worksheet.columns = [
      { header: 'Snippet', key: 'snippet', width: 30 },
      { header: 'Image Filename', key: 'image', width: 30 },
      { header: 'Annotation ID', key: 'id', width: 20 },
      { header: 'Created', key: 'created', width: 20 },
      { header: 'Target', key: 'target', width: 20 }
    ];

    annotations.forEach(({ annotation, image, snippet }, index) => {
      const embeddedImage = workbook.addImage({
        buffer: snippet.data,
        extension: 'png',
      });

      worksheet.addRow({
        image: image.name,
        id: annotation.id,
        created: annotation.created,
        target: JSON.stringify(annotation.target)
      });

      const aspectRatio = snippet.width / snippet.height;
      const boxAspectRatio = 300 / 100;

      let scaledWidth: number;
      let scaledHeight: number;

      if (aspectRatio > boxAspectRatio) {
        scaledWidth = 300;
        scaledHeight = scaledWidth / aspectRatio;
      } else {
        scaledHeight = 100;
        scaledWidth = scaledHeight * aspectRatio;
      }

      worksheet.addImage(embeddedImage, {
        tl: { col: 0, row: index + 1 },
        ext: { width: scaledWidth, height: scaledHeight }
      });

      worksheet.lastRow.height = 100;
    });

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.ms-excel'
      });
  
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = 'annotations.xlsx';
      anchor.click();
    });
  });
}