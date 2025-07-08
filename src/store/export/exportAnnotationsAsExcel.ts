import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { DataModelStore, Store } from '@/store';
import { W3CAnnotationBody, W3CImageAnnotation } from '@annotorious/react';
import { CanvasInformation, EntityType, Image, PropertyDefinition } from '@/model';
import { ImageSnippet, getAnnotationsWithSnippets } from '@/utils/getImageSnippet';
import { addImageToCell, fitColumnWidths } from './utils';

interface ImageAnnotationSnippetTuple {

  image: Image | CanvasInformation;

  path: string[];

  annotation: W3CImageAnnotation;

  snippet?: ImageSnippet;

}

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

const createEntityWorksheet = (
  workbook: any, 
  annotations: ImageAnnotationSnippetTuple[], 
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

  annotations.forEach(({ annotation, image, path, snippet }) => {
    // All bodies that point to this entity, or to an entity that's a child of this entity
    const entityBodies = (Array.isArray(annotation.body) ? annotation.body : [annotation.body])
      .filter(isDescendant);

    entityBodies.forEach(body => {
      // Fixed columns
      const row = {
        image: image.name,
        folder: path.join('/'),
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
  annotations: ImageAnnotationSnippetTuple[]
) => {
  const worksheet = workbook.addWorksheet('Notes');

  worksheet.columns = [
    { header: 'Snippet', key: 'snippet', width: 30 },
    { header: 'Image Filename', key: 'image', width: 30 },
    { header: 'Folder Name', key: 'folder', width: 30 },
    { header: 'Annotation ID', key: 'id', width: 20 },
    { header: 'Created', key: 'created', width: 20 },
    { header: 'Note', key: 'note', width: 50 }
  ];

  let rowIndex = 1;

  annotations.forEach(({ annotation, image, path, snippet }) => {
    const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    const note = bodies.find(b => b.purpose === 'commenting')?.value;
    if (note) {
      worksheet.addRow({
        image: image.name,
        folder: path.join('/'),
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

  // One step for comfort ;-) Then one for each image, plus final step for creating the XLSX
  const progressIncrement = 100 / (images.length + 2);
  onProgress(progressIncrement);

  const promise = images.reduce<Promise<ImageAnnotationSnippetTuple[]>>((promise, image, idx) => {
    return promise.then(all => {
      // While we're at it, resolve image folder path
      const folder = 'uri' in image 
        ? store.iiifResources.find(r => r.id === image.manifestId).folder
        : image.folder;

      return root.resolve(folder).then(path => {
        return getAnnotationsWithSnippets(image, store, masked, true)
          .then(t => { 
            onProgress((idx + 2) * progressIncrement);

            return [
              ...all,
              ...t.map(({ annotation, snippet }) => 
                ({ image, path: [root.name, ...path], annotation, snippet }))
            ]
          });
        })
      })
    }, Promise.resolve([]));

  promise.then(annotations => {
    const workbook = new ExcelJS.Workbook();

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