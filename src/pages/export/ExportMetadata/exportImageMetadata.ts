import { Store } from '@/store';
import { downloadCSV } from '@/utils/download';
import { aggregateSchemaFields, zipMetadata } from '@/utils/metadata';

export const exportImageMetadataCSV = async (store: Store) => {
  const { images } = store;
  const { imageSchemas } = store.getDataModel();

  const columns = aggregateSchemaFields(imageSchemas);

  Promise.all(images.map(image => store.getImageMetadata(image.id).then(metadata => ({ image, metadata }))))
    .then(results => results.map(({ image, metadata }) => {
      const entries = zipMetadata(columns, metadata);
      return Object.fromEntries([['image', image.name], ...entries]);
    }))
    .then(rows => downloadCSV(rows, 'image_metadata.csv'));
}