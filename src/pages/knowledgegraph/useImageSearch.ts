import { Folder, PropertyDefinition } from '@/model';
import { useStore } from '@/store';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';

interface SchemaPropertyDefinition { 

  type: 'IMAGE' | 'FOLDER';

  property: PropertyDefinition;

}

interface SchemaProperty {

  type: 'IMAGE' | 'FOLDER';

  propertyName: string;

  value: any;

}

export const useImageSearch = () => {

  const store = useStore();

  /** Lists the parent sub-folder hierarchy for the given image **/
  const getParentFolders = (imageId: string) => {
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

  /** Utility method to list metadata properties in all folder/image schemas **/
  const listMetadataProperties = (): SchemaPropertyDefinition[] => {
    const model = store.getDataModel();

    const schemas = [
      ...model.folderSchemas.map(schema => ({ type: 'FOLDER', schema })), 
      ...model.imageSchemas.map(schema => ({ type: 'IMAGE', schema }))
    ];

    return schemas.reduce((all, { type, schema }) => (
      [...all, ...(schema.properties || []).map(property => ({ type, property }))]
    ), []);
  }

  const listMetadataValues = (type: 'FOLDER' | 'IMAGE', propertyName: string): Promise<string[]> => {
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

  /** Helper to get the aggregated metadata (image and parent folders) for the given image ID **/
  const getAggregatedMetadata = (imageId: string): Promise<SchemaProperty[]> => {

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

    const annotationToProperties = (type: 'IMAGE' | 'FOLDER', annotation: W3CAnnotation): SchemaProperty[] => {
      const body = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;
      return bodyToProperties(type, body);
    }

    const folders = getParentFolders(imageId);
    
    // Go through folders from the top and aggregate metadata values
    const folderMetadata = folders.reduce<Promise<SchemaProperty[]>>((promise, folder) => 
      promise.then(properties => {
        return store.getFolderMetadata(folder.id).then(annotation => {
          // TODO overwrite existing properties with those of more lower-level folders
          return [...properties, ...annotationToProperties('FOLDER', annotation) ];
        });
      }), Promise.resolve([]));

    const imageMetadata = store.getImageMetadata(imageId).then(body => bodyToProperties('IMAGE', body));

    return Promise.all([folderMetadata, imageMetadata]).then(res => res.flat());
  }

  /** Find image where 'definition' (image/folder + prop) = value **/
  const findImages = (definition: SchemaPropertyDefinition, value: string) => {
    const { images } = store;

    // TODO

  }

  return { getAggregatedMetadata, getParentFolders, listMetadataProperties, listMetadataValues };

}