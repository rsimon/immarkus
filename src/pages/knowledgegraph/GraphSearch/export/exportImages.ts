import { Store } from '@/store';
import { Image } from '@/model';
import { getAggregatedMetadata, listAllMetadataProperties } from '../searchUtils';
import { SchemaPropertyValue } from '../Types';
import { serializePropertyValue } from '@/utils/serialize';
import { downloadCSV } from '@/utils/download';

interface ImageMetadata {

  image: Image;

  metadata: SchemaPropertyValue[];

}

export const exportImages = (store: Store, imageIds: string[]) => {
  const columns = listAllMetadataProperties(store).map(p => `${p.type.toLowerCase()}:${p.propertyName}`);

  const promise = imageIds.reduce<Promise<ImageMetadata[]>>((promise, id) => promise.then(rows => {
    const image = store.getImage(id);
    return getAggregatedMetadata(store, id).then(metadata => {
      return [...rows, { image, metadata }]
    });
  }), Promise.resolve([]));

  promise.then(metadata => {
    const rows = metadata.map(({ image, metadata }) => {
      const serialized = Object.fromEntries(metadata.map(m => {
        const key = `${m.type.toLowerCase()}:${m.propertyName}`;
        const values = serializePropertyValue(m.propertyType, m.value);
        return [key, values.join(' ')];
      }));

      const rows = Object.fromEntries(columns.map(key => (
        [key, serialized[key]]
      )));

      return { image: image.name, ...rows };
    });

    downloadCSV(rows, 'image_results.csv');
  });
}