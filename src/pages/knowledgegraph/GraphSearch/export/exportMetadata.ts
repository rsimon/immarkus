import { CanvasInformation, Folder, IIIFManifestResource, Image } from '@/model';
import { getManifestMetadata, Store } from '@/store';
import { getFullPath } from '@/store/export/utils';
import { resolveManifestsWithId } from '@/utils/iiif';
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

export const exportFolders = (store: Store, folderIds: string[], onProgress: (progress: number) => void) => {
  const model = store.getDataModel();

  const columns = listFolderMetadataProperties(store)
    .filter(p => !p.builtIn)
    .map(p => `${p.type.toLowerCase()}:${p.propertyName}`);

  const promise = folderIds.reduce<Promise<FolderMetadata[]>>((promise, id) => promise.then(rows => {
    const folder : Folder | IIIFManifestResource = 
      id.startsWith('iiif:') ? store.getIIIFResource(id.substring(5)) as IIIFManifestResource : store.getFolder(id) as Folder;

    if (!folder) {
      console.warn(`Missing folder: ${id}`);
      return Promise.resolve(rows);
    } 

    const meta = 'uri' in folder
      ? getManifestMetadata(store, folder.id).then(t => t.annotation)
      : store.getFolderMetadata(folder.handle);

    return meta.then(a => annotationToProperties(model, 'FOLDER', a)).then(metadata => {
      return [...rows, { folder, metadata }]
    });
  }), Promise.resolve([]));

  return promise.then(metadata => {
    const manifests = metadata
      .filter(m => 'canvases' in m.folder)
      .map(f => f.folder as IIIFManifestResource);

    // This is where the bottleneck is - start forwarding progress updates
    const progressIncrement = 100 / (manifests.length + 1);
    let progress = 0;

    const updateProgress = () => {
      progress += progressIncrement;
      onProgress(progress);
    }

    updateProgress();

    return resolveManifestsWithId(manifests, updateProgress).then(resolved => {
      const rows = metadata.map(({ folder, metadata }) => {
        const serialized = serialize(metadata);

        const iiifMetadata = resolved.find(r => r.id === folder.id)?.manifest.getMetadata() || [];

        const rows = Object.fromEntries([
          ...columns.map(key => ([key, serialized[key]])),
          ...iiifMetadata.map(m => ([m.label, m.value]))
        ]);
  
        return { folder: folder.name, ...rows };
      });

      onProgress(100);
  
      return downloadExcel(rows, 'search_results_metadata.xlsx');
    });
  });
}

export const exportImages = (store: Store, imageIds: string[], onProgress: (progress: number) => void) => {
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
    const canvases = metadata
      .filter(m => 'uri' in m.image)
      .map(m => m.image as CanvasInformation);

    const manifestIds = [...new Set(canvases.reduce<Set<string>>((manifestIds, info) => (
      new Set([...manifestIds, info.manifestId])
    ), new Set([])))];

    // This is where the bottleneck is - start forwarding progress updates
    const progressIncrement = 100 / (manifestIds.length + 1);
    let progress = 0;

    const updateProgress = () => {
      progress += progressIncrement;
      onProgress(progress);
    }

    updateProgress();

    return resolveManifestsWithId(
      manifestIds.map(id => store.getIIIFResource(id) as IIIFManifestResource),
      updateProgress
    ).then(resolved => {
      const rows = metadata.map(({ image, metadata }) => {
        const path = getFullPath(image, store, resolved);

        const serialized = serialize(metadata);

        const manifest = ('uri' in image) 
          ? resolved.find(r => r.id === image.manifestId)?.manifest
          : undefined;

        const manifestMetadata = manifest?.getMetadata() || [];

        const canvasMetadata = manifest?.canvases
          .find(c => c.id === (image as CanvasInformation).uri)?.getMetadata() || [];
  
        const rows = Object.fromEntries([
          ...columns.map(key => ([key, serialized[key]])),
          ...manifestMetadata.map(m => ([m.label, m.value])),
          ...canvasMetadata.map(m => ([m.label, m.value]))
        ]);
  
        return { image: image.name, path: path.join('/'), ...rows };
      });
  
      return downloadExcel(rows, 'search_results_metadata.xlsx');
    });
  });

}