import { Folder, Image, MetadataSchema } from '@/model';
import { DataModelStore, Store } from '@/store';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { SchemaPropertyValue, SchemaProperty, ObjectType, SubCondition } from './Types';
import { serializePropertyValue } from '@/utils/serialize';
import { Graph, GraphNode } from '../Types';

/** Converts a metadata annotation body to a list of SchemaProperties **/
const bodyToProperties = (model: DataModelStore, type: 'IMAGE' | 'FOLDER', body: W3CAnnotationBody): SchemaPropertyValue[] => {
  if (!body) return [];

  if (!('properties' in body)) return [];

  if (!body.source) return [];

  const schema = type === 'FOLDER' 
    ? model.getFolderSchema(body.source) : model.getImageSchema(body.source);

  if (!schema?.properties) return [];

  return Object.entries(body.properties).map(([key, value]) => ({
    type,
    propertyType: schema.properties.find(d => d.name === key).type,
    propertyName: key,
    value
  }));
}

// Converts a metadata annotation to a list of SchemaProperties
const annotationToProperties = (model: DataModelStore, type: 'IMAGE' | 'FOLDER', annotation?: W3CAnnotation): SchemaPropertyValue[] => {
  if (!annotation) return [];

  const body = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;
  return bodyToProperties(model, type, body);
}

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

const listMetadataProperties = (schemas: { type: ObjectType, schema: MetadataSchema }[]): SchemaProperty[] => {
  // Different schemas may include properties with the same name. De-duplicate!
  return schemas.reduce<SchemaProperty[]>((all, { type, schema }) => {
    const properties: SchemaProperty[] = (schema.properties || []).map(p => ({ type, propertyName: p.name }));
    return [
      ...all,
      ...properties.reduce<SchemaProperty[]>((toAdd, p) => {
        const existing = all.find(a => a.type === p.type && a.propertyName === p.propertyName);
        return existing ? toAdd : [...toAdd, p];
      }, [])
    ];
  }, []);
}

/** List metadata properties from all folder/image schemas **/
export const listAllMetadataProperties = (store: Store): SchemaProperty[] => {
  const model = store.getDataModel();

  const schemas = [
    ...model.folderSchemas.map(schema => ({ type: 'FOLDER' as ObjectType, schema })), 
    ...model.imageSchemas.map(schema => ({ type: 'IMAGE' as ObjectType, schema }))
  ];

  return listMetadataProperties(schemas);
}

/** List metadata properties from all folder schemas **/
export const listFolderMetadataProperties = (store: Store): SchemaProperty[] => {
  const model = store.getDataModel();
  const schemas = model.folderSchemas.map(schema => ({ type: 'FOLDER' as ObjectType, schema }));
  return listMetadataProperties(schemas);
}

/** Lists all metadata values used on the given FOLDER/IMAGE metadata property **/
export const listMetadataValues = (
  store: Store, type: 'FOLDER' | 'IMAGE', propertyName: string
): Promise<string[]> => {

  const model = store.getDataModel();

  // Helper to get the relevant values from a list of metadata annotation bodies
  const getMetadataObjectOptions = (bodies: W3CAnnotationBody[]) =>
    bodies.reduce<any[]>((all, body) => {
      if ('properties' in body) {
        const value = body.properties[propertyName];

        if (!value) return all;

        if (!body.source) return all;

        const schema = type === 'IMAGE' 
          ? model.getImageSchema(body.source) : model.getFolderSchema(body.source);

        if (!schema?.properties) return all;

        const definition = schema.properties.find(p => p.name === propertyName);
        if (!definition) return all;

        const serialized = serializePropertyValue(definition, value);

        const exists = all.find(o => o === serialized);
        return exists ? all : [...all, serialized];
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
const getAggregatedMetadata = (store: Store, imageId: string): Promise<SchemaPropertyValue[]> => {
  const model = store.getDataModel();

  // Merges to lists of SchemaProperties, so that properties that appear in the 'next'
  // list overwrite those in the 'current' list.
  const mergeProperties = (current: SchemaPropertyValue[], next: SchemaPropertyValue[]): SchemaPropertyValue[] => {
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
  const folderMetadata = folders.reduce<Promise<SchemaPropertyValue[]>>((promise, folder) => 
    promise.then(properties => {
      return store.getFolderMetadata(folder.id).then(annotation => {
        return mergeProperties(properties, annotationToProperties(model, 'FOLDER', annotation));
      });
    }), Promise.resolve([]));

  const imageMetadata = store.getImageMetadata(imageId).then(body => bodyToProperties(model, 'IMAGE', body));

  return Promise.all([folderMetadata, imageMetadata]).then(res => res.flat());
}

const hasMatchingValue = (propertyValue: SchemaPropertyValue, value?: string) => {
  // Match all non-empty
  if (!value) return true;

  const serialized = serializePropertyValue(propertyValue.propertyType, propertyValue.value);
  return serialized === value;
}

/** Find images where property name and value match on the given FOLDER or IMAGE property **/
export const findImagesByMetadata = (store: Store, propertyType: 'FOLDER' | 'IMAGE', propertyName: string, value?: string): Promise<Image[]> => {
  const { images } = store;

  // Warning: heavy operation! Resolve aggregated metadata for all images.
  const promise = images.reduce<Promise<{ image: Image, metadata: SchemaPropertyValue[] }[]>>((promise, image) => promise.then(all => {
    return getAggregatedMetadata(store, image.id).then(metadata => {
      return [...all, { image, metadata }]
    });
  }), Promise.resolve([]));

  return promise.then(metadata => {
    return metadata
      .filter(({ metadata }) =>
        metadata.find(m => 
          m.type === propertyType && m.propertyName === propertyName && hasMatchingValue(m, value)))
      .map(({ image }) => image);
  });

}

export const findFoldersByMetadata = (store: Store, propertyName: string, value?: string): Promise<Folder[]> => {
  const { folders } = store;

  const model = store.getDataModel();

  const promise = folders.reduce<Promise<{ folder: Folder, metadata: SchemaPropertyValue[] }[]>>((promise, folder) => promise.then(all => {
    return store.getFolderMetadata(folder.id).then(annotation => {
      const metadata = annotationToProperties(model, 'FOLDER', annotation);
      return [...all, {  folder, metadata }]
    });
  }), Promise.resolve([]));

  return promise.then(metadata => {
    return metadata
      .filter(({ metadata }) =>
        metadata.find(m => 
          m.propertyName === propertyName && hasMatchingValue(m, value)))
      .map(({ folder }) => folder);
  });
}

export const findImagesByEntityClass = (
  store: Store, 
  graph: Graph, 
  entityClass: string
): GraphNode[] => {
  const imageNodes = graph.nodes.filter(n => n.type === 'IMAGE');

  const model = store.getDataModel();

  const descendants = model.getDescendants(entityClass);
  const ids = new Set(descendants.map(t => t.id));

  return imageNodes.filter(n => {
    const linked = graph.getLinkedNodes(n.id);
    return linked.some(l => l.type === 'ENTITY_TYPE' && ids.has(l.id));
  });
}

export const findImagesByEntityConditions = (
  store: Store,
  annotations: { image: Image, annotations: W3CAnnotation[] }[],
  entityId: string, 
  conditions: SubCondition[]
): Image[] => {
  // ID of this entity and all descendant types
  const model = store.getDataModel();

  const type = model.getEntityType(entityId, true);

  // Should never happen
  if ((type.properties || []).length === 0) return;

  const descendants = 
    new Set(model.getDescendants(entityId).map(t => t.id));
  
  return annotations.reduce<Image[]>((images, { image, annotations}) => {
    // Check if this image has *any annotations* that have *any bodies*
    // that match the given query conditions
    const hasMatchingAnnotations = annotations.some(annotation => {
      const bodies = 
        (Array.isArray(annotation.body) ? annotation.body : [annotation.body])
          .filter(b => b.purpose === 'classifying' && descendants.has(b.source));

      // Check if any body matches the given query conditions.
      return bodies.some(body => {
        if (!('properties' in body)) return false;

        return conditions.every(c => { 
          const definition = type.properties.find(p => p.name === c.Attribute);
          if (definition) {
            const serialized = serializePropertyValue(definition, body.properties[c.Attribute]);
            return serialized === c.Value;
          }
        });
      });
    });

    return hasMatchingAnnotations ? [...images, image] : images;
  }, []);  
}