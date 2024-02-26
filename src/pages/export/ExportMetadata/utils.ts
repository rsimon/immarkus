import Papa from 'papaparse';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { W3CAnnotationBody } from '@annotorious/react';
import { serializePropertyValue } from '@/utils/serialize';

export interface SchemaField { schema: string, definition: PropertyDefinition };

export const aggregateSchemaFields = (schemas: MetadataSchema[]): SchemaField[] =>
  (schemas || []).reduce<SchemaField[]>((agg, schema) => (  
    [...agg, ...schema.properties.map(d => ({ schema: schema.name, definition: d }))]
  ), []);

export const zipMetadata = (columns: SchemaField[], metadata?: W3CAnnotationBody) => {
  const properties = metadata && 'properties' in metadata ? metadata.properties || {} : {};

  const entries = columns.map(column => {
    const columnValue = column.schema === metadata?.source 
      ? serializePropertyValue(column.definition, properties[column.definition.name])
      : '';

    return [`${column.schema}: ${column.definition.name}`, columnValue]
  });

  return entries;
}

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