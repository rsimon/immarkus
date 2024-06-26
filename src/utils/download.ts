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