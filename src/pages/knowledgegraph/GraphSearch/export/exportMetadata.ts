import { getManifestMetadata, Store } from '@/store';
import { CanvasInformation, Folder, IIIFManifestResource, Image } from '@/model';
import { serializePropertyValue } from '@/utils/serialize';
import { downloadExcel } from '@/utils/download';
import { SchemaPropertyValue } from '../../Types';
import { 
  annotationToProperties, 
  getAggregatedMetadata, 
  listAllMetadataProperties, 
  listFolderMetadataProperties 
} from '../searchUtils';

interface FolderMetadata {

  folder: Folder | IIIFManifestResource;

  metadata: SchemaPropertyValue[];

}

interface ImageMetadata {

  image: Image | CanvasInformation;

  metadata: SchemaPropertyValue[];

}

const serialize = (metadata: SchemaPropertyValue[]) => Object.fromEntries(metadata.map(m => {
  const key = `${m.type.toLowerCase()}:${m.propertyName}`;

  const definitionLike = {
    type: m.propertyType,
    name: m.propertyName
  };

  const values = serializePropertyValue(definitionLike, m.value);
  return [key, values.join(' ')];
}));

export const exportFolders = (store: Store, folderIds: string[]) => {
  const model = store.getDataModel();

  const columns = listFolderMetadataProperties(store)
    .filter(p => !p.builtIn)
    .map(p => `${p.type.toLowerCase()}:${p.propertyName}`);

  const promise = folderIds.reduce<Promise<FolderMetadata[]>>((promise, id) => promise.then(rows => {
    const folder : Folder | IIIFManifestResource = 
      id.startsWith('iiif:') ? store.getIIIFResource(id) as IIIFManifestResource : store.getFolder(id) as Folder;

    const meta = 'uri' in folder
      ? getManifestMetadata(store, folder.id).then(t => t.annotation)
      : store.getFolderMetadata(folder.handle);

    return meta.then(a => annotationToProperties(model, 'FOLDER', a)).then(metadata => {
      return [...rows, { folder, metadata }]
    });
  }), Promise.resolve([]));

  return promise.then(metadata => {
    const rows = metadata.map(({ folder, metadata }) => {
      const serialized = serialize(metadata);

      const rows = Object.fromEntries(columns.map(key => (
        [key, serialized[key]]
      )));

      return { folder: folder.name, ...rows };
    });

    downloadExcel(rows, 'search_results_metadata.xlsx');
  });
}

export const exportImages = (store: Store, imageIds: string[]) => {
  const columns = listAllMetadataProperties(store)
    .filter(p => !p.builtIn)
    .map(p => `${p.type.toLowerCase()}:${p.propertyName}`);

  const promise = imageIds.reduce<Promise<ImageMetadata[]>>((promise, id) => promise.then(rows => {
    const image = id.startsWith('iiif:') ? store.getCanvas(id) : store.getImage(id);

    return getAggregatedMetadata(store, id).then(metadata => {
      return [...rows, { image, metadata }]
    });
  }), Promise.resolve([]));

  return promise.then(metadata => {
    const rows = metadata.map(({ image, metadata }) => {
      const serialized = serialize(metadata);

      const rows = Object.fromEntries(columns.map(key => (
        [key, serialized[key]]
      )));

      return { image: image.name, ...rows };
    });

    downloadExcel(rows, 'search_results_metadata.xlsx');
  });
}