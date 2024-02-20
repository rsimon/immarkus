import Papa from 'papaparse';
import { Download } from 'lucide-react';
import { Store, useStore } from '@/store';
import { Button } from '@/ui/Button';
import { PropertyDefinition } from '@/model';

const toString = (definition: PropertyDefinition, value?: any) => {
  if (!value)
    return '';

  if (definition.type === 'measurement')
    return `${value.value} ${value.unit}`;
  else if (definition.type === 'geocoordinates')
    return `${value[0]}/${value[1]}`;
  else
    return value.toString();
}

export const exportImageMetadataCSV = async (store: Store) => {
  const { images } = store;

  const schema = store.getDataModel().getImageSchema('default');
  if (!schema) return;

  Promise.all(images.map(image => store.getImageMetadata(image.id).then(metadata => ({ image, metadata }))))
    .then(results => results.map(({ image, metadata }) => {
      const entries = (schema.properties || []).map(definition => {
        const properties = metadata && 'properties' in metadata ? metadata.properties || {} : {};
        return [definition.name, toString(definition, properties[definition.name])]
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

export const ExportMetadata = () => {

  const store = useStore();

  return (
    <ul className="py-2">
      <li>
        <section className="w-full py-2 flex flex-row gap-20 justify-between">
          <div>
            <h3 className="font-medium mb-1 leading-relaxed">
              Image Metadata
            </h3>

            <p className="text-sm">
              Image metadata as a flat list in CSV spreadsheet format. One row per image, one column per metadata 
              schema field.
            </p>
          </div>

          <div>
            <Button 
              className="whitespace-nowrap flex gap-2"
              onClick={() => exportImageMetadataCSV(store)}>
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </section>
      </li>
    </ul>
  )

}