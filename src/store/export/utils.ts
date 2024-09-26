export const fitColumnWidths = (worksheet: any) => {
  worksheet.columns.forEach(column => {
    const lengths = column.values.map(v => v.toString().length);
    const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
    column.width = maxLength;
  });

  worksheet.columns[0].width = 30;
}