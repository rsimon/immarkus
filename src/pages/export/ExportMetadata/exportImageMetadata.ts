import Papa from 'papaparse';
import { PropertyDefinition } from '@/model';
import { Store } from '@/store';

interface SchemaField { schema: string, definition: PropertyDefinition };

const aggregateImageSchemaFields = (store: Store): SchemaField[] => {
  const { imageSchemas } = store.getDataModel();

  return (imageSchemas || []).reduce<SchemaField[]>((agg, schema) => (  
    [...agg, ...schema.properties.map(d => ({ schema: schema.name, definition: d }))]
  ), []);
}  

const serializeField = (definition: PropertyDefinition, value?: any) => {
  if (!value)
    return '';

  if (definition.type === 'measurement')
    return `${value.value} ${value.unit}`;
  else if (definition.type === 'geocoordinate')
    return `${value[0]}/${value[1]}`;
  else
    return value.toString();
}

export const exportImageMetadataCSV = async (store: Store) => {
  const { images } = store;

  const columns = aggregateImageSchemaFields(store);

  Promise.all(images.map(image => store.getImageMetadata(image.id).then(metadata => ({ image, metadata }))))
    .then(results => results.map(({ image, metadata }) => {
      const properties = metadata && 'properties' in metadata ? metadata.properties || {} : {};

      const entries = columns.map(column => {
        const columnValue = column.schema === metadata?.source 
          ? serializeField(column.definition, properties[column.definition.name])
          : '';

        return [`${column.schema}: ${column.definition.name}`, columnValue]
      });

      return Object.fromEntries([['image', image.name], ...entries]);
    }))
    .then(rows => {
      const csv = Papa.unparse(rows);

      const data = new TextEncoder().encode(csv);
      const blob = new Blob([data], {
        type: 'text/csv;charset=utf-8'
      });
  
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = 'image_metadata.csv';
      anchor.click();
    });
}