import { useState } from 'react';
import { W3CImageAnnotation } from '@annotorious/react';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import * as ExcelJS from 'exceljs/dist/exceljs.min.js';
import { Store } from '@/store';
import { getImageSnippet, ImageSnippet } from '@/utils/getImageSnippet';
import { Graph, GraphLinkPrimitive, GraphNode } from '../../Types';
import { addImageToCell } from '@/store/export/utils';
import { getEntityTypes } from '@/utils/annotation';

interface RowData {

  relationship_name?: string;

  relationship_id: string;

  directed?: string;

  // created?: string;

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

  // Keep in mind, W3C has an inverted idea of "source" and "target"!
  return Promise.all([
    store.findAnnotation(link.target), 
    store.findAnnotation(link.body)
  ]).then(([[sourceAnnotation, sourceImage], [targetAnnotation, targetImage]]) => {
    return Promise.all([
      store.loadImage(sourceImage.id),
      store.loadImage(targetImage.id)
    ]).then(([sourceLoadedImage, targetLoadedImage]) => {
      return Promise.all([
        getImageSnippet(sourceLoadedImage, sourceAnnotation as W3CImageAnnotation),
        getImageSnippet(targetLoadedImage, targetAnnotation as W3CImageAnnotation)
      ]).then(([sourceSnippet, targetSnippet]) => ({
        relationship_name: relationshipName,
        relationship_id: link.id,
        directed: relationshipType?.directed ? 'YES' : undefined,
        source_snippet: sourceSnippet,  
        source_filename: sourceImage.name,
        source_foldername: store.getFolder(sourceImage.folder)?.name,      
        source_annotation_id: sourceAnnotation.id,
        source_entity_classes: getEntityTypes(sourceAnnotation).join(','),
        target_snippet: targetSnippet,
        target_filename: targetImage.name,
        target_foldername: store.getFolder(targetImage.folder)?.name,
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
export const _exportRelationships = (
  graph: Graph, 
  store: Store, 
  nodes: GraphNode[],
  onProgress: ((progress: number) => void),
  filename: string
) => {
  // Returns all relationship primitives linked to this (image or entity class) node.
  const getRelationPrimitives = (node: GraphNode) => {
    const links = graph.getLinks(node.id);
    return links.reduce<GraphLinkPrimitive[]>((all, link) => {
      return [
        ...all, 
        ...link.primitives.filter(({ type }) => 
          type === 'HAS_RELATED_ANNOTATION_IN' || type === 'IS_RELATED_VIA_ANNOTATION')
      ]
    }, []);
  }

  // All relationship primitives, on all nodes in the matched set
  const relationshipPrimitives = nodes.reduce<GraphLinkPrimitive[]>((all, node) => 
    ([...all, ...getRelationPrimitives(node)]), []);

  // Distinct relationships
  const relationships = relationshipPrimitives.reduce<[W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][]>((all, p) => {
    const [link, meta] = p.data || [undefined, undefined];

    if (!link) return all; // Should never happen

    // Note that primitives generally appear twice (on source and target node) - de-duplicate!
    const existing = all.find(t => t[0].id === link.id);
    if (existing) {
      return all;
    } else {
      return [...all, [link, meta]];
    }
  }, []);

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

        addImageToCell(workbook, worksheet, source_snippet, 3, rowIndex);
        addImageToCell(workbook, worksheet, target_snippet, 8, rowIndex);

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

export const useExcelRelationshipExport = () => {

  const [busy, setBusy] = useState(false);

  const [progress, setProgress] = useState(0);

  const exportRelationships = (graph: Graph, store: Store, nodes: GraphNode[], filename: string) => {    
    setBusy(true);

    const onProgress = (progress: number) => {
      setProgress(progress);
  
      if (progress === 100)
        setBusy(false);
    }

    _exportRelationships(graph, store, nodes, onProgress, filename);
  }
  
  return { busy, progress, exportRelationships };

}