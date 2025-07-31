import murmur from 'murmurhash';
import { W3CImageAnnotation } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { CanvasInformation, FileImage, LoadedIIIFImage } from '@/model';
import { Store } from '@/store';
import { addImageToCell } from '@/store/export/utils';
import { getEntityTypes } from '@/utils/annotation';
import { getImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { fetchManifest } from '@/utils/iiif/fetchManifest';

interface RowData {

  relationship_name?: string;

  relationship_id: string;

  directed?: string;

  created?: string;

  source_snippet: ImageSnippet;
  
  source_filename: string;

  source_foldername: string;

  source_annotation_id: string;

  source_entity_classes?: string;

  target_snippet: ImageSnippet;
  
  target_filename: string;

  target_foldername: string;

  target_annotation_id: string;

  target_entity_classes?: string;

}

const toRowData = (
  relationship: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation], 
  store: Store
) => {
  const model = store.getDataModel();

  const [link, meta] = relationship;

  const relationshipName: string | undefined = meta?.body?.value;

  const relationshipType = relationshipName ? model.getRelationshipType(relationshipName) : undefined;

  const getFolder = (image: FileImage | CanvasInformation) => {
    if ('uri' in image) {
      const manifest = store.iiifResources.find(r => r.id === image.manifestId);
      return manifest.folder;
    } else {
      return image.folder;
    }
  }

  const getLoadedImage = (source: FileImage | CanvasInformation) => {
    if ('uri' in source) {
      const manifest = store.getIIIFResource(source.manifestId);

      return fetchManifest(manifest.uri).then(parsed => {
        const canvas = parsed.canvases.find(c => c.id === source.uri);

        return {
          canvas,
          folder: manifest.folder,
          id: `iiif:${manifest.id}:${murmur.v3(canvas.id)}`,
          manifestId: manifest.id,
          name: canvas.getLabel(),
          path: manifest.path
        } as LoadedIIIFImage;
      });
    } else {
      return store.loadImage(source.id);
    }
  }

  // Keep in mind, W3C has an inverted idea of "source" and "target"!
  return Promise.all([
    store.findAnnotation(link.target), 
    store.findAnnotation(link.body)
  ]).then(([sourceTuple, targetTuple]) => {
    const [sourceAnnotation, sourceImage] = sourceTuple;
    const [targetAnnotation, targetImage] = targetTuple;

    return Promise.all([
      getLoadedImage(sourceImage),
      getLoadedImage(targetImage)
    ]).then(([sourceLoadedImage, targetLoadedImage]) => {
      return Promise.all([
        getImageSnippet(sourceLoadedImage, sourceAnnotation as W3CImageAnnotation, true),
        getImageSnippet(targetLoadedImage, targetAnnotation as W3CImageAnnotation, true)
      ]).then(([sourceSnippet, targetSnippet]) => ({
        relationship_name: relationshipName,
        relationship_id: link.id,
        directed: relationshipType?.directed ? 'YES' : undefined,
        created: link.created,
        source_snippet: sourceSnippet,  
        source_filename: sourceImage.name,
        source_foldername: getFolder(sourceImage)?.name,      
        source_annotation_id: sourceAnnotation.id,
        source_entity_classes: getEntityTypes(sourceAnnotation).join(','),
        target_snippet: targetSnippet,
        target_filename: targetImage.name,
        target_foldername: getFolder(targetImage)?.name,
        target_annotation_id: targetAnnotation.id,
        target_entity_classes: getEntityTypes(targetAnnotation).join(',')
      } as RowData))
    })
  });
}

/**
 * Exports an XLSX, with a single worksheet, with the following columns:
 * 
 * - Relationship Name
 * - Relationship ID
 * - Directed
 * - Created
 * - Source Snippet
 * - Source Image Filename
 * - Source Folder Name
 * - Source Annotation ID
 * - Source Entity Classes
 * - Target Snippet
 * - Target Image Filename
 * - Target Folder Name
 * - Target Annotation ID
 * - Target Entity Classes
 */
export const exportRelationshipsAsExcel = (
  store: Store, 
  relationships: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][],
  onProgress: ((progress: number) => void),
  filename: string
) => {
  // One step for comfort ;-) Then one for each relationship, plus final step for creating the XLSX
  const progressIncrement = 100 / (relationships.length + 2);
    onProgress(progressIncrement);

  const promise = relationships.reduce<Promise<RowData[]>>((promise, relationship, idx) => (
    promise.then(all => toRowData(relationship, store).then(data => { 
      onProgress((idx + 2) * progressIncrement);

      return [...all, data]
    }))
  ), Promise.resolve([]));

  promise.then(data => {
    const workbook = new ExcelJS.Workbook();

    workbook.creator = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
    workbook.lastModifiedBy = `IMMARKUS v${process.env.PACKAGE_VERSION}`;
    workbook.created = new Date();
    workbook.modified = new Date();
  
    const worksheet = workbook.addWorksheet();
  
    if (data.length > 0) {
      const headers = Object.keys(data[0]);

      worksheet.columns = headers.map(header => (
        { header, key: header, width: 30 }
      ));

      let rowIndex = 1;
  
      data.forEach(({ source_snippet, target_snippet, ...rest }) => {
        worksheet.addRow(rest);

        addImageToCell(workbook, worksheet, source_snippet, 4, rowIndex);
        addImageToCell(workbook, worksheet, target_snippet, 9, rowIndex);

        rowIndex += 1;
      });
    }
  
    workbook.xlsx.writeBuffer().then(buffer => {
      onProgress(100);

      const blob = new Blob([buffer], {
        type: 'application/vnd.ms-excel'
      });
  
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = filename;
      anchor.click();
    });
  });

}
