import { Folder, Image, PropertyDefinition } from '@/model';
import { Store } from '@/store';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { SchemaProperty, SchemaPropertyDefinition } from './Types';

/** Lists the parent sub-folder hierarchy for the given image **/
export const getParentFolders = (store: Store, imageId: string) => {
  const image = store.getImage(imageId);

  const getParentFoldersRecursive = (next: Folder, hierarchy: Folder[] = []): Folder[] => {
    if (next.parent) {
      const folder = store.getFolder(next.parent);

      const isRootFolder = !('id' in folder);
      if (isRootFolder) {
        return [next, ...hierarchy];
      } else {
        return getParentFoldersRecursive(folder, [next, ...hierarchy]);
      }
    } else {
      return [next, ...hierarchy];
    }
  }

  if (image) {
    const folder = store.getFolder(image.folder);

    const isRootFolder = !('id' in folder);
    if (isRootFolder) {
      return [];
    } else {
      return getParentFoldersRecursive(folder);
    }
  } else {
    return [];
  }
}

/** List metadata properties from all folder/image schemas **/
export const listAllMetadataProperties = (store: Store): SchemaPropertyDefinition[] => {
  const model = store.getDataModel();

  const schemas = [
    ...model.folderSchemas.map(schema => ({ type: 'FOLDER', schema })), 
    ...model.imageSchemas.map(schema => ({ type: 'IMAGE', schema }))
  ];

  return schemas.reduce((all, { type, schema }) => (
    [...all, ...(schema.properties || []).map(property => ({ type, property }))]
  ), []);
}

/** Lists all metadata values used on the given FOLDER/IMAGE metadata property **/
export const listMetadataValues = (store: Store, type: 'FOLDER' | 'IMAGE', propertyName: string): Promise<any[]> => {
  // Helper to get the relevant values from a list of metadata annotation bodies
  const getMetadataObjectOptions = (bodies: W3CAnnotationBody[]) =>
    bodies.reduce<string[]>((all, body) => {
      if ('properties' in body) {
        const value = body.properties[propertyName];
        if (value) {
          const exists = all.find(o => o === value);
          return exists ? all : [...all, JSON.stringify(value)];
        } else {
          return all;
        }
      } else {
        return all;
      }
    }, []);

  if (type === 'FOLDER') {
    return Promise.all(store.folders.map(f => store.getFolderMetadata(f.id)))
      // Note that folders have a single metadata annotation
      .then(annotations => {
        const bodies = annotations
          .filter(Boolean)
          .map(a => Array.isArray(a.body) ? a.body[0] : a.body)

        return getMetadataObjectOptions(bodies);
      })
  } else {
    return Promise.all(store.images.map(i => store.getImageMetadata(i.id)))
      // Note that images have a list of metadata bodies
      .then(bodies => {
        return getMetadataObjectOptions(bodies);
      });
  }
}

/** Get the aggregated metadata (image and parent folders) for the given image ID **/
const getAggregatedMetadata = (store: Store, imageId: string): Promise<SchemaProperty[]> => {
  // Converts a metadata annotation body to a list of SchemaProperties
  const bodyToProperties = (type: 'IMAGE' | 'FOLDER', body: W3CAnnotationBody): SchemaProperty[] => {
    if ('properties' in body) {
      return Object.entries(body.properties).map(([key, value]) => ({
        type,
        propertyName: key,
        value
      }));
    } else {
      return [];
    }
  }

  // Converts a metadata annotation to a list of SchemaProperties
  const annotationToProperties = (type: 'IMAGE' | 'FOLDER', annotation: W3CAnnotation): SchemaProperty[] => {
    const body = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;
    return bodyToProperties(type, body);
  }

  // Merges to lists of SchemaProperties, so that properties that appear in the 'next'
  // list overwrite those in the 'current' list.
  const mergeProperties = (current: SchemaProperty[], next: SchemaProperty[]): SchemaProperty[] => {
    const currentNames = new Set(current.map(p => p.propertyName));
    const nextNames = new Set(next.map(p => p.propertyName));

    // Properties in 'next' that are no in 'current'
    const toAdd = next.filter(p => !currentNames.has(p.propertyName));

    return [
      ...current.map(c => nextNames.has(c.propertyName) ? next.find(n => n.propertyName === c.propertyName) : c),
      ...toAdd
    ];
  }

  const folders = getParentFolders(store, imageId);
  
  // Go through folders from the top and aggregate metadata values
  const folderMetadata = folders.reduce<Promise<SchemaProperty[]>>((promise, folder) => 
    promise.then(properties => {
      return store.getFolderMetadata(folder.id).then(annotation => {
        return mergeProperties(properties, annotationToProperties('FOLDER', annotation));
      });
    }), Promise.resolve([]));

  const imageMetadata = store.getImageMetadata(imageId).then(body => bodyToProperties('IMAGE', body));

  return Promise.all([folderMetadata, imageMetadata]).then(res => res.flat());
}

/** Find images where property name and value match on the given FOLDER or IMAGE property **/
export const findImages = (store: Store, propertyType: 'FOLDER' | 'IMAGE', propertyName: string, value: string): Promise<Image[]> => {
  const { images } = store;

  // Warning: heavy operation! Resolve aggregated metadata for all images.
  const promise = images.reduce<Promise<{ image: Image, metadata: SchemaProperty[] }[]>>((promise, image) => promise.then(all => {
    return getAggregatedMetadata(store, image.id).then(metadata => {
      return [...all, { image, metadata }]
    })
  }), Promise.resolve([]));

  return promise.then(metadata => {
    return metadata
      .filter(({ metadata }) =>
        metadata.find(m => m.type === propertyType && m.propertyName === propertyName && m.value === value))
      .map(({ image }) => image);
  });

}