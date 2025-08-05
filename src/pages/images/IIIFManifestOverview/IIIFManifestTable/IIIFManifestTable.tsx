import { memo, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  getAnnotationsInRange, 
  getLastEdit, 
  LAST_EDIT_COLUMN_TEMPLATE, 
  NAME_COLUMN_TEMPLATE, 
  sortByAnnotations, 
  sortByLastEdit, 
  sortByName, 
  sortIcon, 
  TABLE_EMPTY_MESSAGE, 
  TABLE_HEADER_CLASS, 
  TABLE_SKELETON
} from '../../ImagesUtils';

const folderToRow = (range: CozyRange, annotations: Record<string, W3CAnnotation[]>): ItemTableRow => {
  const annotationsInRange = getAnnotationsInRange(range, annotations);

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

export const IIIFManifestTable = memo((props: IIIFManifestOverviewLayoutProps) => {

  const { annotations, canvases, folders, hideUnannotated } = props;

  const [ queryParams ] = useSearchParams();

  const parsedManifest = useIIIFResource(props.manifest.id);

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  useEffect(() => {
    if ((folders.length + canvases.length) === 0) return;

    if (!parsedManifest) return;

    setRows([
      ...folders.map(f => folderToRow(f, annotations)),
      ...canvases.map(c => canvasToRow(c, annotations[c.id] || [], parsedManifest))
    ]);
  }, [folders, canvases, parsedManifest, annotations]);

  const filteredRows = useMemo(() => (
    hideUnannotated ? rows.filter(r => r.annotations > 0) : rows
  ), [rows, hideUnannotated]);

  useLayoutEffect(() => {
    const canvasId = queryParams.get('canvas');
    if (!canvasId) return;

    setTimeout(() => {
      const target = Array.from(document.getElementsByClassName(canvasId))[0];
      if (target) {
        target.scrollIntoView();
      }
    }, 1);
  }, [queryParams]);

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

  const rowClassName = (row: ItemTableRow) => {
    if (row.type === 'folder') return;
    return murmur.v3(row.data.canvas.id).toString()
  } 

  return (
    <div className="mt-12 rounded-md border cursor-pointer">
      <DataTable 
        removableSort
        rowClassName={rowClassName}
        value={filteredRows} 
        onRowClick={onRowClick}
        sortIcon={sortIcon}
        emptyMessage={props.loading ? TABLE_SKELETON : TABLE_EMPTY_MESSAGE}>
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

});