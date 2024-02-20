import Papa from 'papaparse';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { W3CAnnotationBody } from '@annotorious/react';

export interface SchemaField { schema: string, definition: PropertyDefinition };

export const aggregateSchemaFields = (schemas: MetadataSchema[]): SchemaField[] =>
  (schemas || []).reduce<SchemaField[]>((agg, schema) => (  
    [...agg, ...schema.properties.map(d => ({ schema: schema.name, definition: d }))]
  ), []);

export const serializeField = (definition: PropertyDefinition, value?: any) => {
  if (!value)
    return '';

  if (definition.type === 'measurement')
    return `${value.value} ${value.unit}`;
  else if (definition.type === 'geocoordinate')
    return `${value[0]}/${value[1]}`;
  else
    return value.toString();
}

export const zipMetadata = (columns: SchemaField[], metadata?: W3CAnnotationBody) => {
  const properties = metadata && 'properties' in metadata ? metadata.properties || {} : {};

  const entries = columns.map(column => {
    const columnValue = column.schema === metadata?.source 
      ? serializeField(column.definition, properties[column.definition.name])
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