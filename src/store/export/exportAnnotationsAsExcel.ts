import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { DataModelStore, Store } from '@/store';
import { W3CAnnotationBody, W3CImageAnnotation } from '@annotorious/react';
import { CanvasInformation, EntityType, IIIFManifestResource, Image, PropertyDefinition } from '@/model';
import { ImageSnippet, getAnnotationsWithSnippets } from '@/utils/getImageSnippet';
import { addImageToCell, fitColumnWidths } from './utils';
import { resolveManifestsWithId } from '@/utils/iiif';
import { CozyManifest } from 'cozy-iiif';

interface BaseSourceAnnotationSnippetTuple {

  path: string[];

  annotation: W3CImageAnnotation;

  snippet?: ImageSnippet;

}

interface ImageAnnotationSnippetTuple extends BaseSourceAnnotationSnippetTuple {

  image: Image;

}

interface CanvasAnnotationSnippetTuple extends BaseSourceAnnotationSnippetTuple {

  image: CanvasInformation;

  manifest: CozyManifest;

}

type SourceAnnotationSnippetTuple = ImageAnnotationSnippetTuple | CanvasAnnotationSnippetTuple;

/**
 * Creates a list of all PropertyDefinitions in this EntityType, and all
 * children.
 */
const enumerateChildren = (root: EntityType, model: DataModelStore): EntityType[] => {

  const enumerateChildrenRecursive = (type: EntityType): EntityType[] => {
    const children = model.getChildTypes(type.id);

    if (children.length === 0) {
      return [type];
    } else {
      return children.reduce<EntityType[]>((all, child) => {
        return [...all, ...enumerateChildrenRecursive(child)];
      }, [type]);
    }
  }

  return enumerateChildrenRecursive(root);
}

const aggregateSchemaFields = (types: EntityType[]): PropertyDefinition[] =>
  types.reduce<PropertyDefinition[]>((agg, type) => (  
    [...agg, ...(type.properties || [])]
  ), []);

const getIIIFPath = (tuple: SourceAnnotationSnippetTuple) => {
  if (!('uri' in tuple.image) || !('manifest' in tuple)) return;

  const canvasId = tuple.image.uri;
  const nodes = tuple.manifest.getTableOfContents().getBreadcrumbs(canvasId);
  return nodes.map(n => n.getLabel()).join('/');
} 

const createEntityWorksheet = (
  workbook: any, 
  annotations: SourceAnnotationSnippetTuple[], 
  entityType: EntityType,
  store: Store
) => {
  const model = store.getDataModel();

  const types = enumerateChildren(entityType, model);

  const schema = aggregateSchemaFields(types);

  const worksheet = workbook.addWorksheet(entityType.label || entityType.id);

  worksheet.columns = [
    { header: 'Snippet', key: 'snippet', width: 30 },
    { header: 'Image Filename', key: 'image', width: 30 },
    { header: 'Folder Name', key: 'folder', width: 30 },
    { header: 'IIIF Manifest Name', key: 'iiif_manifest', width: 60 },
    { header: 'IIIF ToC Path', key: 'iiif_path', width: 60 },
    { header: 'Annotation ID', key: 'id', width: 20 },
    { header: 'Created', key: 'created', width: 20 },
    { header: 'Entity Class', key: 'entity', width: 20 },
    ...schema.map(field => ({
      header: field.name,
      key: `@property_${field.name}`,
      width: 20
    }))
  ];

  // Tests if the given entity body is a descendant of the
  // current 'entityType' arg.
  const isDescendant = (body: W3CAnnotationBody) => {
    // Body has no source - definitely not a descendant
    if (!body.source)
      return false;

    // Body points to this entity type - count as a descendant
    if (body.source === entityType.id)
      return true;

    // Otherwise, look at the parent types for this type
    const t = model.getEntityType(body.source);
    if (!t)
      return false;

    const ancestors = model.getAncestors(t);
    if (ancestors.length === 0)
      return false;

    return ancestors.some(e => e.id === entityType.id);
  }

  let rowIndex = 1;

  annotations.forEach(tuple => {
    const { annotation, image, path, snippet } = tuple;

    // All bodies that point to this entity, or to an entity that's a child of this entity
    const entityBodies = (Array.isArray(annotation.body) ? annotation.body : [annotation.body])
      .filter(isDescendant);

    entityBodies.forEach(body => {
      // Fixed columns
      const row = {
        image: image.name,
        folder: path.join('/'),
        iiif_manifest: 'manifest' in tuple ? tuple.manifest?.getLabel() : undefined,
        iiif_path: getIIIFPath(tuple),
        id: annotation.id,
        created: annotation.created,
        entity: body.source
      };

      // Schema columns
      const entries = Object.entries('properties' in body ? body.properties || {} : {});
      entries.forEach(([key, value]) => row[`@property_${key}`] = value);

      worksheet.addRow(row);

      if (snippet)
        addImageToCell(workbook, worksheet, snippet, 0, rowIndex);

      rowIndex += 1;
    });
  });

  fitColumnWidths(worksheet);

  // Remove sheet if empty
  if (rowIndex === 1)
    workbook.removeWorksheet(worksheet.id);
}

const createNotesWorksheet = (
  workbook: any, 
  annotations: SourceAnnotationSnippetTuple[]
) => {
  const worksheet = workbook.addWorksheet('Notes');

  worksheet.columns = [
    { header: 'Snippet', key: 'snippet', width: 30 },
    { header: 'Image Filename', key: 'image', width: 30 },
    { header: 'Folder Name', key: 'folder', width: 30 },
    { header: 'IIIF Manifest Name', key: 'iiif_manifest', width: 60 },
    { header: 'IIIF ToC Path', key: 'iiif_path', width: 60 },
    { header: 'Annotation ID', key: 'id', width: 20 },
    { header: 'Created', key: 'created', width: 20 },
    { header: 'Note', key: 'note', width: 50 }
  ];

  let rowIndex = 1;

  annotations.forEach(tuple => {
    const { annotation, image, path, snippet } = tuple;

    const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    const note = bodies.find(b => b.purpose === 'commenting')?.value;
    if (note) {
      worksheet.addRow({
        image: image.name,
        folder: path.join('/'),
        iiif_manifest: 'manifest' in tuple ? tuple.manifest?.getLabel() : undefined,
        iiif_path: getIIIFPath(tuple),
        id: annotation.id,
        created: annotation.created,
        note
      });

      if (snippet)
        addImageToCell(workbook, worksheet, snippet, 0, rowIndex);

      rowIndex += 1;
    }
  });

  fitColumnWidths(worksheet);
}

export const exportAnnotationsAsExcel = (
  store: Store, 
  images: (Image | CanvasInformation)[], 
  onProgress: ((progress: number) => void), 
  masked: boolean,
  filename?: string
) => {
  const model = store.getDataModel();
  const root = store.getRootFolder().handle;

  const canvases = images.filter(i => 'uri' in i);

  const manifests = [
    ...new Set(canvases.map(c => c.manifestId))
  ].map(id => store.getIIIFResource(id) as IIIFManifestResource);

  // One step for comfort ;-) Then one for each image, plus final step for creating the XLSX
  const progressIncrement = 100 / (manifests.length + images.length + 2);

  let progress = 0;

  const updateProgress = () => {
    progress += progressIncrement;
    onProgress(progress);
  }

  updateProgress();

  const promise = resolveManifestsWithId(manifests, updateProgress).then(manifests => {
    return images.reduce<Promise<SourceAnnotationSnippetTuple[]>>((promise, image, idx) => {
      return promise.then(all => {
        // While we're at it, resolve image folder path
        const folder = 'uri' in image 
          ? store.iiifResources.find(r => r.id === image.manifestId)?.folder
          : image.folder;

        const manifest = 'uri' in image 
          ? manifests.find(m => m.id === image.manifestId)?.manifest : undefined;

        return root.resolve(folder).then(path => {
          return getAnnotationsWithSnippets(image, store, masked, true)
            .then(t => { 
              onProgress((idx + 2) * progressIncrement);

              return [
                ...all,
                ...t.map(({ annotation, snippet }) => ({ 
                    image, 
                    path: [root.name, ...path], 
                    manifest,
                    annotation, 
                    snippet 
                  } as SourceAnnotationSnippetTuple))
              ]
            });
          })
        })
      }, Promise.resolve([]));
  });

  promise.then(async annotations => {
    const workbook = new ExcelJS.Workbook();

    /**
     * For hacking
     *
    const snippets = annotations.filter(a => a.snippet && 'data' in a.snippet).map(a => a.snippet! as FileImageSnippet);
    const root = store.getRootFolder();

    let imagesFolder;
    try {
      imagesFolder = await root.handle.getDirectoryHandle('images', { create: true });
    } catch (error) {
      console.error('Failed to create images folder:', error);
      return;
    }

    for (const snippet of snippets) {
      try {
        const filename = `${uuidv4()}.jpg`;

        // TODO write the file data into the root folder (ideally a subfolder named 'images')
        snippet.data // Uint8Array<ArrayBufferLike>
        root.handle // FileSystemDirectoryHandle

        // Create a file handle in the images folder
        const fileHandle = await imagesFolder.getFileHandle(filename, { create: true });
        
        // Create a writable stream
        const writable = await fileHandle.createWritable();
        
        // Write the data
        await writable.write(snippet.data);
        
        // Close the writable stream
        await writable.close();
        
        console.log(`Successfully wrote ${filename}`);
      } catch {
        console.error('Failed')
      }
    }
    */

    workbook.creator = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
    workbook.lastModifiedBy = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create one worksheet per root entity type
    model.getRootTypes().forEach(entityType => createEntityWorksheet(workbook, annotations, entityType, store));

    // Create one worksheet for the notes
    createNotesWorksheet(workbook, annotations);
  
    workbook.xlsx.writeBuffer().then(buffer => {
      onProgress(100);

      const blob = new Blob([buffer], {
        type: 'application/vnd.ms-excel'
      });
  
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = filename || 'annotations.xlsx';
      anchor.click();
    });
  });
}