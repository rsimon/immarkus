import { useEffect, useMemo, useState } from 'react';
import murmur from 'murmurhash';
import { DataTable, DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { W3CAnnotation } from '@annotorious/react';
import { CozyManifest, CozyRange } from 'cozy-iiif';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { CanvasInformation } from '@/model';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { IIIFManifestOverviewLayoutProps } from '../IIIFManifestOverviewLayoutProps';
import { CanvasItem, ItemTableRow } from '../../Types';
import { IIIFManifestTableRowThumbnail } from './IIIFManifestTableRowThumbnail';
import { IIIFManifestTableRowActions } from './IIIFManifestTableRowActions';
import { 
  ANNOTATIONS_COLUMN_TEMPLATE, 
  DIMENSIONS_COLUMN_TEMPLATE, 
  getLastEdit, 
  LAST_EDIT_COLUMN_TEMPLATE, 
  NAME_COLUMN_TEMPLATE, 
  sortByAnnotations, 
  sortByLastEdit, 
  sortByName, 
  sortIcon, 
  TABLE_HEADER_CLASS 
} from '../../ImagesUtils';

const folderToRow = (range: CozyRange, annotations: Record<string, W3CAnnotation[]>): ItemTableRow => {

  const getAnnotationsRecursive = (range: CozyRange): W3CAnnotation[] => {
    // Canvases directly contained in this range
    const annotationsOnCanvases = range.canvases.reduce<W3CAnnotation[]>((agg, canvas) => {
      const id = murmur.v3(canvas.id);
      return [...agg, ...(annotations[id] || [])];
    }, []);

    // Subranges
    const annotationsOnSubRanges = range.ranges.reduce<W3CAnnotation[]>((agg, range) => {
      return [...agg, ...getAnnotationsRecursive(range)]
    }, []);

    return [...annotationsOnCanvases, ...annotationsOnSubRanges];
  }

  const annotationsInRange = getAnnotationsRecursive(range);

  return {
    data: range,
    type: 'folder',
    name: range.getLabel(),
    lastEdit: getLastEdit(annotationsInRange),
    annotations: annotationsInRange.length
  }
}

const canvasToRow = (
  info: CanvasInformation, 
  annotations: W3CAnnotation[],
  parsed: CozyManifest
): ItemTableRow => {
  const canvas = parsed.canvases.find(c => c.id === info.uri);
  if (!canvas)
    throw `Integrity error: canvas ${info.id} not in manifest`;

  return {
    data: {
      type: 'canvas',
      canvas,
      info
    } as CanvasItem,
    type: 'image',
    name: info.name,
    dimensions: [canvas.width, canvas.height],
    lastEdit: getLastEdit(annotations),
    annotations: annotations.length
  };
}


export const IIIFManifestTable = (props: IIIFManifestOverviewLayoutProps) => {

  const { annotations, canvases, folders, hideUnannotated } = props;

  const parsedManifest = useIIIFResource(props.manifest.id);

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  const filteredRows = useMemo(() => (
    hideUnannotated ? rows.filter(r => r.annotations > 0) : rows
  ), [rows, hideUnannotated]);

  useEffect(() => {
    if (!parsedManifest) return;

    setRows([
      ...folders.map(f => folderToRow(f, annotations)),
      ...canvases.map(c => canvasToRow(c, annotations[c.id] || [], parsedManifest))
    ]);
  }, [folders, canvases, parsedManifest, annotations]);

  const typeTemplate = (row: ItemTableRow) => {
    const item = row.data as CanvasItem;

    return (
      <div className="pl-2">
        {row.type === "folder" ? (
          <div className="relative">
            <FolderIcon className="size-10" />
            <IIIFIcon
              className="size-4 text-white absolute bottom-1 left-1.5"
              light
            />
          </div>
        ) : (
          <IIIFManifestTableRowThumbnail 
            canvas={item.canvas} />
        )}
      </div>
    );
  };

  const actionsTemplate = (row: ItemTableRow) => (
    <IIIFManifestTableRowActions 
      manifest={props.manifest}
      data={row.data} 
      onSelectCanvas={props.onSelect} />
  );

  const onRowClick = (evt: DataTableRowClickEvent) => {
    const { type, data } = evt.data as ItemTableRow;
    if (type === 'folder')
      props.onOpenRange(data);
    else if (type === 'image')
      props.onOpenCanvas(data.canvas);
  }

  return parsedManifest &&  (
    <div className="mt-12 rounded-md border cursor-pointer">
      <DataTable 
        removableSort
        value={filteredRows} 
        onRowClick={onRowClick}
        sortIcon={sortIcon}>
        <Column
          field="type" 
          header="Type" 
          headerClassName={TABLE_HEADER_CLASS}
          body={typeTemplate} />

        <Column 
          sortable
          sortFunction={sortByName}
          field="name" 
          header="Name" 
          headerClassName={TABLE_HEADER_CLASS} 
          body={NAME_COLUMN_TEMPLATE} />

        <Column
          field="dimensions"
          header="Dimensions"
          headerClassName={TABLE_HEADER_CLASS}
          body={DIMENSIONS_COLUMN_TEMPLATE} />

        <Column
          sortable
          sortFunction={sortByLastEdit}
          field="lastEdit" 
          header="Last Edit" 
          headerClassName={TABLE_HEADER_CLASS}
          body={LAST_EDIT_COLUMN_TEMPLATE} />

        <Column
          sortable
          sortFunction={sortByAnnotations}
          field="annotations" 
          header="Annotations" 
          headerClassName={TABLE_HEADER_CLASS} 
          body={ANNOTATIONS_COLUMN_TEMPLATE} />

        <Column 
          field="actions" 
          body={actionsTemplate} />
      </DataTable>
    </div>
  )

}