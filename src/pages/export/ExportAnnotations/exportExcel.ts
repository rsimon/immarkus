import { W3CAnnotation } from '@annotorious/react';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { Store } from '@/store';

export const exportAnnotationsAsExcel = (store: Store) => {
  const { images } = store;

  const annotations = images.reduce<Promise<W3CAnnotation[]>>((promise, image) => {
    return promise.then((all) => {
      return store.getAnnotations(image.id).then(annotations => {
        return [...all, ...annotations]
      })
    })
  }, Promise.resolve([]));

  annotations.then(annotations => {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'IMMARKUS';
    workbook.lastModifiedBy = 'IMMARKUS';
    workbook.created = new Date();
    workbook.modified = new Date();
    // workbook.lastPrinted = new Date();
  
    const worksheet = workbook.addWorksheet('Annotations');
    
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 20 },
      { header: 'Created', key: 'created', width: 20 },
      { header: 'Target', key: 'target', width: 20 }
    ];

    annotations.forEach(annotation => {
      worksheet.addRow({
        id: annotation.id,
        created: annotation.created,
        target: JSON.stringify(annotation.target)
      });
    })
     
    console.log(workbook);

    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], {
        type: 'application/json;charset=utf-8'
      });
  
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = 'export.xlsx';
      anchor.click();
    });
  });
}