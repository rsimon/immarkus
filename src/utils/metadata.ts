import { W3CAnnotationBody } from '@annotorious/react';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { serializePropertyValue } from './serialize';

export interface SchemaField { schema: string, definition: PropertyDefinition };

export const aggregateSchemaFields = (schemas: MetadataSchema[]): SchemaField[] =>
  (schemas || []).reduce<SchemaField[]>((agg, schema) => (  
    [...agg, ...schema.properties.map(d => ({ schema: schema.name, definition: d }))]
  ), []);

export const zipMetadata = (columns: SchemaField[], metadata?: W3CAnnotationBody) => {
  const properties = metadata && 'properties' in metadata ? metadata.properties || {} : {};

  const entries = columns.map(column => {
    const columnValue = column.schema === metadata?.source 
      ? serializePropertyValue(column.definition, properties[column.definition.name]).join(' ')
      : '';

    return [`${column.schema}: ${column.definition.name}`, columnValue]
  });

  return entries;
}