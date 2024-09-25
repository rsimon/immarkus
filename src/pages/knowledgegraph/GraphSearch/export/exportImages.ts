import { Store } from '@/store';
import { Image } from '@/model';
import { getAggregatedMetadata, listAllMetadataProperties } from '../searchUtils';
import { serializePropertyValue } from '@/utils/serialize';
import { downloadExcel } from '@/utils/download';
import { SchemaPropertyValue } from '../../Types';

interface ImageMetadata {

  image: Image;

  metadata: SchemaPropertyValue[];

}

export const exportImages = (store: Store, imageIds: string[]) => {
  const columns = listAllMetadataProperties(store)
    .filter(p => !p.builtIn)
    .map(p => `${p.type.toLowerCase()}:${p.propertyName}`);

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

        const definitionLike = {
          type: m.propertyType,
          name: m.propertyName
        };

        const values = serializePropertyValue(definitionLike, m.value);
        return [key, values.join(' ')];
      }));

      const rows = Object.fromEntries(columns.map(key => (
        [key, serialized[key]]
      )));

      return { image: image.name, ...rows };
    });

    downloadExcel(rows, 'search_results_metadata.xlsx');
  });
}