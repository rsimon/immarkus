import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { DataModelStore, Store } from '@/store';
import { W3CAnnotationBody, W3CImageAnnotation } from '@annotorious/react';
import { ImageSnippet, getAnntotationsWithSnippets } from './ImageSnippet';
import { EntityType, Image, PropertyDefinition } from '@/model';
import { serializePropertyValue } from '@/utils/serialize';

interface ImageAnnotationSnippetTuple {

  image: Image;

  annotation: W3CImageAnnotation;

  snippet?: ImageSnippet;

}

const addImageToCell = (
  workbook: any,
  worksheet: any,
  snippet: ImageSnippet,
  row: number
) => {
  const embeddedImage = workbook.addImage({
    buffer: snippet.data,
    extension: 'jpg',
  });

  const aspectRatio = snippet.width / snippet.height;
  const boxAspectRatio = 300 / 100;

  let scaledWidth: number;
  let scaledHeight: number;

  if (aspectRatio > boxAspectRatio) {
    scaledWidth = 300;
    scaledHeight = scaledWidth / aspectRatio;
  } else {
    scaledHeight = 100;
    scaledWidth = scaledHeight * aspectRatio;
  }

  worksheet.addImage(embeddedImage, {
    tl: { col: 0, row },
    ext: { width: scaledWidth, height: scaledHeight }
  });

  worksheet.lastRow.height = 100;
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

const createWorksheet = (
  workbook: any, 
  annotations: ImageAnnotationSnippetTuple[], 
  entityType: EntityType,
  model: DataModelStore
) => {
  const types = enumerateChildren(entityType, model);

  const schema = aggregateSchemaFields(types);

  const worksheet = workbook.addWorksheet(entityType.label || entityType.id);

  worksheet.columns = [
    { header: 'Snippet', key: 'snippet', width: 30 },
    { header: 'Image Filename', key: 'image', width: 30 },
    { header: 'Annotation ID', key: 'id', width: 20 },
    { header: 'Created', key: 'created', width: 20 },
    { header: 'Entity Class', key: 'entity', width: 20 },
    ...schema.map(field => ({
      header: field.name,
      key: field.name,
      width: 20
    }))
  ];

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

  annotations.forEach(({ annotation, image, snippet }) => {
    // All bodies that point to this entity, or to an entity that's a child of this entity
    const entityBodies = (Array.isArray(annotation.body) ? annotation.body : [annotation.body])
      .filter(isDescendant);

    entityBodies.forEach(body => {
      // Fixed columns
      const row = {
        image: image.name,
        id: annotation.id,
        created: annotation.created,
        entity: body.source
      };

      // Schema columns
      const entries = Object.entries('properties' in body ? body.properties || {} : {});
      entries.forEach(([key, value]) => row[key] = value);

      worksheet.addRow(row);

      if (snippet)
        addImageToCell(workbook, worksheet, snippet, rowIndex);

      rowIndex += 1;
    });
  });

  // Auto-fit column widths
  worksheet.columns.forEach(column => {
    const lengths = column.values.map(v => v.toString().length);
    const maxLength = Math.max(...lengths.filter(v => typeof v === 'number'));
    column.width = maxLength;
  });

  worksheet.columns[0].width = 30;
}

export const exportAnnotationsAsExcel = (store: Store, onProgress: ((progress: number) => void)) => {
  const model = store.getDataModel();

  const { images } = store;

  // One step for comfort ;-) Then one for each image, plus final step for creating the XLSX
  const progressIncrement = 100 / (images.length + 2);
  onProgress(progressIncrement);

  const promise = images.reduce<Promise<ImageAnnotationSnippetTuple[]>>((promise, image, idx) => {
    return promise.then(all => {
      return getAnntotationsWithSnippets(image, store)
        .then(t => { 
          onProgress((idx + 2) * progressIncrement);

          return [
            ...all,
            ...t.map(({ annotation, snippet }) => ({ image, annotation, snippet }))
          ]
        });
      })
    }, Promise.resolve([]));

  promise.then(annotations => {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
    workbook.lastModifiedBy = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create one worksheet per root entity type
    model.getRootTypes().forEach(entityType => createWorksheet(workbook, annotations, entityType, model));
  
    workbook.xlsx.writeBuffer().then(buffer => {
      onProgress(100);

      const blob = new Blob([buffer], {
        type: 'application/vnd.ms-excel'
      });
  
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = 'annotations.xlsx';
      anchor.click();
    });
  });
}