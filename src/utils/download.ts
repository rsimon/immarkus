import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import Papa from 'papaparse';

export const downloadCSV = (rows: any[], filename: string) => {
  const csv = Papa.unparse(rows);

  const data = new TextEncoder().encode(csv);
  const blob = new Blob([data], {
    type: 'text/csv;charset=utf-8'
  });

  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = filename;
  anchor.click();
}

export const downloadExcel = (rows: any[], filename: string) => {
  const workbook = new ExcelJS.Workbook();

  workbook.creator = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
  workbook.lastModifiedBy = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet();

  if (rows.length > 0) {
    // Aggregate all row object keys
    const headers = [...rows.reduce<Set<string>>((headers, row) => {
      const h = Object.keys(row);
      return new Set([...headers, ...h]);
    }, new Set([]))];

    worksheet.columns = headers.map(header => (
      { header, key: header, width: 30 }
    ));

    rows.forEach(row => {
      worksheet.addRow(row)
    });
  }

  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], {
      type: 'application/vnd.ms-excel'
    });

    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = filename;
    anchor.click();
  });

}