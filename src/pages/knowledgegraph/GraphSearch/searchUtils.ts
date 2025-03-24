import { CanvasInformation, Folder, IIIFManifestResource, Image, MetadataSchema, RootFolder } from '@/model';
import { DataModelStore, getManifestMetadata, Store } from '@/store';
import { W3CAnnotation, W3CAnnotationBody } from '@annotorious/react';
import { serializePropertyValue } from '@/utils/serialize';
import { parseIIIFId } from '@/utils/iiif';
import { 
  Graph, 
  GraphNode, 
  SchemaPropertyValue, 
  SchemaProperty, 
  SubCondition, 
  GraphNodeType
} from '../Types';

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
    propertyType: schema.properties.find(d => d.name === key)?.type,
    propertyName: key,
    value
  })).filter(p => p.propertyType);
}

// Converts a metadata annotation to a list of SchemaProperties
export const annotationToProperties = (model: DataModelStore, type: 'IMAGE' | 'FOLDER', annotation?: W3CAnnotation): SchemaPropertyValue[] => {
  if (!annotation) return [];

  const body = Array.isArray(annotation.body) ? annotation.body[0] : annotation.body;
  return bodyToProperties(model, type, body);
}

/** Lists the parent sub-folder hierarchy for the given image **/
export const getParentFolders = (
  store: Store, 
  sourceId: string
): (RootFolder | Folder | IIIFManifestResource)[] => {
  const getParentFoldersRecursive = (next: Folder, hierarchy: Folder[] = []): (Folder | RootFolder)[] => {
    if (next.parent) {
      const folder = store.getFolder(next.parent);

      const isRootFolder = !('id' in folder);
      if (isRootFolder) {
        return [folder, next, ...hierarchy];
      } else {
        return getParentFoldersRecursive(folder, [next, ...hierarchy]);
      }
    } else {
      return [next, ...hierarchy];
    }
  }

  if (sourceId.startsWith('iiif')) {
    const [manifestId, _] = parseIIIFId(sourceId);
    const manifest = store.getIIIFResource(manifestId) as IIIFManifestResource;

    const folder = store.getFolder(manifest.folder);
    const isRootFolder = !('id' in folder);
    if (isRootFolder) {
      return [manifest];
    } else {
      return [...getParentFoldersRecursive(folder), manifest];
    }
  } else {
    const image = store.getImage(sourceId);
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
}

const listMetadataProperties = (schemas: { type: GraphNodeType, schema: MetadataSchema }[]): SchemaProperty[] => {
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

const sortProperties = (properties: SchemaProperty[]) =>
  [...properties].sort((a, b) => {
    if (a.builtIn !== b.builtIn) {
      return a.builtIn ? -1 : 1;
    } else {
      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      } else {
        return a.propertyName.localeCompare(b.propertyName);
      }    
    }  
  });

/** List metadata properties from all folder/image schemas **/
export const listAllMetadataProperties = (store: Store): SchemaProperty[] => {
  const model = store.getDataModel();

  const schemas = [
    ...model.folderSchemas.map(schema => ({ type: 'FOLDER' as GraphNodeType, schema })), 
    ...model.imageSchemas.map(schema => ({ type: 'IMAGE' as GraphNodeType, schema }))
  ];

  return sortProperties([
    { type: 'FOLDER', propertyName: 'folder name', builtIn: true },
    { type: 'IMAGE', propertyName: 'image filename', builtIn: true },
    ...listMetadataProperties(schemas)
  ]);
}

/** List metadata properties from all folder schemas **/
export const listFolderMetadataProperties = (store: Store): SchemaProperty[] => {
  const model = store.getDataModel();
  const schemas = model.folderSchemas.map(schema => ({ type: 'FOLDER' as GraphNodeType, schema }));
  return sortProperties([
    { type: 'FOLDER', propertyName: 'folder name', builtIn: true },
    ...listMetadataProperties(schemas)
  ]);
}

const enumerateNotes = (
  annotations: { sourceId: string, annotations: W3CAnnotation[] }[]
) => {
  return annotations.reduce<{ sourceId: string, note: string }[]>((all, { sourceId, annotations }) => {
    const notesOnThisImage = annotations.reduce<{ sourceId: string, note: string }[]>((all, annotation) => {
      const notes = 
        (Array.isArray(annotation.body) ? annotation.body : [annotation.body])
          .filter(b => b.purpose === 'commenting' && b.value)
          .map(b => ({ sourceId, note: b.value! }));

      return [...all, ...notes];
    }, []);

    return [...all, ...notesOnThisImage];
  }, []);
}

export const listAllNotes = (
  annotations: { sourceId: string, annotations: W3CAnnotation[] }[]
): string[] => {
  const notes = enumerateNotes(annotations);
  return Array.from(new Set(notes.map(n => n.note))).sort();
}

export const findImagesByNote = (
  annotations: { sourceId: string, annotations: W3CAnnotation[] }[],
  note: string
): string[] => {
  const notes = enumerateNotes(annotations);
  const matches = notes.filter(n => n.note === note);
  return Array.from(new Set(matches.map(n => n.sourceId)));
}

export const findImagesByRelationship = (
  store: Store,
  relationship: string
): Promise<string[]> => {
  // All relations tagged with the given relationship
  const relevant = store.listAllRelations().filter(([link, meta]) => meta.body?.value === relationship);

  // IDs of all image annotations linked through the relevant relationships
  const annotationIds = new Set(relevant.reduce<string[]>((all, [link, meta]) => {
    const { target, body } = link;
    return [...all, target, body];
  }, []));

  // IDs of all images for the given annotations
  return [...annotationIds].reduce<Promise<string[]>>((promise, annotationId) => promise.then(all => {
    return store.findImageForAnnotation(annotationId).then(image => {
      const id = 'uri' in image ? `iiif:${image.manifestId}:${image.id}` : image.id;
      return [...all, id];
    });
  }), Promise.resolve([])).then(ids => [...new Set(ids)]); // De-duplicate
}

export const findEntityTypesByRelationship = (
  graph: Graph,
  relationship: string
): string[] => {
  const entityNodes = graph.nodes.filter(n => n.type === 'ENTITY_TYPE');

  const filtered = entityNodes.filter(n => {
    const relationshipLinks = graph.getLinks(n.id).filter(l => l.primitives.some(primitive => (
      primitive.type === 'IS_RELATED_VIA_ANNOTATION' && 
      primitive.value === relationship)));

    return relationshipLinks.length > 0;
  });

  return filtered.map(n => n.id);
}

/** Lists all metadata values used on the given FOLDER/IMAGE metadata property **/
export const listMetadataValues = (
  store: Store, 
  type: 'FOLDER' | 'IMAGE', 
  propertyName: string, 
  builtIn?: boolean
): Promise<string[]> => {
  const model = store.getDataModel();

  if (builtIn) {
    if (type === 'FOLDER' && propertyName === 'folder name') {
      const folderLike = [...store.folders, ...store.iiifResources];
      return Promise.resolve([...new Set(folderLike.map(f => f.name))]);
    } else if (type === 'IMAGE' && propertyName === 'image filename') {
      const imageLike = [
        ...store.images,
        ...store.iiifResources.reduce<CanvasInformation[]>((all, r) => (
          [...all, ...(r as IIIFManifestResource).canvases] 
        ), [])
      ]
      return Promise.resolve([...new Set(imageLike.map(i => i.name))]);
    } else {
      console.error('Unsupported built-in property', type, propertyName);
      return Promise.resolve([]);
    }
  } else {
    // Helper to get the relevant values from a list of metadata annotation bodies
    const getMetadataObjectOptions = (bodies: W3CAnnotationBody[]) =>
      bodies.reduce<any[]>((all, body) => {
        if (body && 'properties' in body) {
          const value = body.properties[propertyName];

          if (!value) return all;

          if (!body.source) return all;

          const schema = type === 'IMAGE' 
            ? model.getImageSchema(body.source) : model.getFolderSchema(body.source);

          if (!schema?.properties) return all;

          const definition = schema.properties.find(p => p.name === propertyName);
          if (!definition) return all;

          const serialized = serializePropertyValue(definition, value);

          const toAdd = serialized.filter(s => !all.includes(s))
          return [...all, ...toAdd];
        } else {
          return all;
        }
      }, []);

    if (type === 'FOLDER') {
      const folderLike = [...store.folders, ...store.iiifResources];

      return Promise.all(folderLike.map(f => {
        if ('uri' in f) {
          return getManifestMetadata(store, f.id).then(t => t.annotation);
        } else {
          return store.getFolderMetadata(f.id);
        }
      })).then(annotations => {
        const bodies = annotations
          .filter(Boolean)
          .map(a => Array.isArray(a.body) ? a.body[0] : a.body)
        return getMetadataObjectOptions(bodies);
      })
    } else {
      const imageLike = [
        ...store.images,
        ...(store.iiifResources as IIIFManifestResource[]).reduce<CanvasInformation[]>((all, r) => (
          [...all, ...r.canvases]
        ), [])
      ].map(i => 'uri' in i ? `iiif:${i.manifestId}:${i.id}` : i.id);

      return Promise.all(imageLike.map(id => store.getImageMetadata(id)))
        // Note that images have a list of metadata bodies
        .then(bodies => {
          return getMetadataObjectOptions(bodies);
        });
    }
  }
}

/** Get the aggregated metadata (image and parent folders) for the given image ID **/
export const getAggregatedMetadata = (store: Store, imageId: string): Promise<SchemaPropertyValue[]> => {
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
      const p = 'uri' in folder
        ? getManifestMetadata(store, folder.id).then(t => t.annotation)
        : store.getFolderMetadata(folder.handle);

      return p.then(annotation => {
        return mergeProperties(properties, annotationToProperties(model, 'FOLDER', annotation));
      });
    }), Promise.resolve([]));

  const imageMetadata = store.getImageMetadata(imageId).then(body => { 
    const props = bodyToProperties(model, 'IMAGE', body);
    return props;
  });

  return Promise.all([folderMetadata, imageMetadata]).then(res => res.flat());
}

const hasMatchingValue = (propertyValue: SchemaPropertyValue, value?: string) => {
  // Match all non-empty
  if (!value) return true;

  const definitionLike = {
    type: propertyValue.propertyType,
    name: propertyValue.propertyName
  };

  const serialized = serializePropertyValue(definitionLike, propertyValue.value);
  return serialized.includes(value);
}

/** Find images where property name and value match on the given FOLDER or IMAGE property **/
export const findImagesByMetadata = (
  store: Store, 
  propertyType: 'FOLDER' | 'IMAGE', 
  propertyName: string, 
  value?: string,
  builtIn?: boolean
): Promise<(Image | CanvasInformation)[]> => {
  const { folders, images } = store;
  
  const iiifResources = store.iiifResources as IIIFManifestResource[];

  const folderLike = [...folders, ...iiifResources];

  const imageLike = [
    ...images,
    ...iiifResources.reduce<CanvasInformation[]>((all, r) => (
      [...all, ...r.canvases] 
    ), [])
  ];

  if (builtIn) {
    if (propertyType === 'FOLDER' && propertyName === 'folder name') {
      if (!value) {
        // All images in sub-folders
        const root = store.getFolderContents(store.getRootFolder().handle);
        const imagesInRoot = new Set(root.images.map(i => i.id));

        // All canvases
        const canvases = iiifResources.reduce<CanvasInformation[]>((all, r) => (
          [...all, ...r.canvases]
        ), []);

        return Promise.resolve([
          ...images.filter(i => !imagesInRoot.has(i.id)),
          ...canvases
        ]);
      } else {
        const folder = folderLike.find(f => f.name === value);
        if (folder) {
          if ('uri' in folder) {
            return Promise.resolve(folder.canvases);
          } else {
            return Promise.resolve(store.listImagesInFolder(folder.id));
          }
        } else {
          return Promise.resolve([]);
        }
      }
    } else if (propertyType === 'IMAGE' && propertyName === 'image filename') {
      // Trivial case: image filename is never empty;
      if (!value) return Promise.resolve(imageLike);
      return Promise.resolve(imageLike.filter(i => i.name === value)); 
    } else {
      console.error('Unsupported built-in property', propertyType, propertyName);
      return Promise.resolve([]);
    }
  } else {
    // Warning: heavy operation! Resolve aggregated metadata for all images.
    const promise = imageLike.reduce<Promise<{ image: Image | CanvasInformation, metadata: SchemaPropertyValue[] }[]>>((promise, image) => 
      promise.then(all => {
        const id = 'uri' in image ? `iiif:${image.manifestId}:${image.id}` : image.id;
        return getAggregatedMetadata(store, id).then(metadata => {
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
  
}

export const findFoldersByMetadata = (
  store: Store, 
  propertyName: string, 
  value?: string,
  builtin?: boolean
): Promise<(Folder | IIIFManifestResource)[]> => {
  const folderLike = [...store.folders, ...(store.iiifResources as IIIFManifestResource[])];

  if (builtin) {
    if (propertyName === 'folder name') {
      return Promise.resolve(folderLike.filter(f => f.name === value));
    } else {
      console.error('Unsupported built-in folder property', propertyName);
      return Promise.resolve([]);
    }
  } else {
    const model = store.getDataModel();

    const promise = folderLike.reduce<Promise<{ folder: Folder | IIIFManifestResource, metadata: SchemaPropertyValue[] }[]>>((promise, folder) => promise.then(all => {
      const p = 'uri' in folder 
        ? getManifestMetadata(store, folder.id).then(t => t.annotation)
        : store.getFolderMetadata(folder.id);

      return p.then(annotation => {
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
  annotations: { sourceId: string, annotations: W3CAnnotation[] }[],
  entityId: string, 
  conditions: SubCondition[]
): string[] => {
  // ID of this entity and all descendant types
  const model = store.getDataModel();

  const type = model.getEntityType(entityId, true);

  if ((type.properties || []).length === 0) return [];

  const descendants = 
    new Set(model.getDescendants(entityId).map(t => t.id));
  
  return annotations.reduce<string[]>((all, { sourceId, annotations }) => {
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
          if (!c.Attribute || !c.Comparator) return; 

          if (c.Comparator === 'IS' && !c.Value) return;

          const definition = type.properties.find(p => p.name === c.Attribute.value);
          if (definition) {
            const serialized = serializePropertyValue(definition, body.properties[c.Attribute.value]);
            return c.Comparator === 'IS'
              ? serialized.includes(c.Value.value)
              : serialized.length > 0;
          }
        });
      });
    });

    return hasMatchingAnnotations ? [...all, sourceId] : all;
  }, []);

}