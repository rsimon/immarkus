import { Store } from '@/store';
import { downloadCSV } from '@/utils/download';
import { aggregateSchemaFields, zipMetadata } from '@/utils/metadata';

export const exportImages = (store: Store, imageIds: string[]) => {
  const { imageSchemas } = store.getDataModel();

  const images = imageIds.map(id => store.getImage(id));

  const columns = aggregateSchemaFields(imageSchemas);

  Promise.all(images.map(image => store.getImageMetadata(image.id).then(metadata => ({ image, metadata }))))
    .then(results => results.map(({ image, metadata }) => {
      const entries = zipMetadata(columns, metadata);
      return Object.fromEntries([['image', image.name], ...entries]);
    }))
    .then(rows => downloadCSV(rows, 'image_results.csv'));
}