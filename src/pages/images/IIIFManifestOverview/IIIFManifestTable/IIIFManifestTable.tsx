import { useEffect, useState } from 'react';
import { DataTable, DataTableRowClickEvent } from 'primereact/datatable';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { IIIFManifestOverviewLayoutProps } from '../IIIFManifestOverviewLayoutProps';
import { Column } from 'primereact/column';
import { CozyManifest, CozyRange } from 'cozy-iiif';
import { CanvasInformation } from '@/model';
import { CanvasItem, ItemTableRow } from '../../Types';
import { sortByAnnotations, sortByLastEdit, sortByName, sortIcon, TABLE_HEADER_CLASS } from '../../ImagesUtils';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { IIIFManifestTableRowThumbnail } from './IIIFManifestTableRowThumbnail';
import { IIIFManifestTableRowActions } from './IIIFManifestTableRowActions';

const folderToRow = (folder: CozyRange): ItemTableRow => {
  return {
    data: folder,
    type: 'folder',
    name: folder.getLabel()
  }
}

const canvasToRow = (
  canvas: CanvasInformation, 
  parsed: CozyManifest
): ItemTableRow => ({
  data: { // CanvasItem
    type: 'canvas',
    canvas: parsed.canvases.find(c => c.id === canvas.uri),
    info: canvas,
  },
  type: 'image',
  name: canvas.name
});

export const IIIFManifestTable = (props: IIIFManifestOverviewLayoutProps) => {

  const { canvases, folders } = props;

  const parsedManifest = useIIIFResource(props.manifest.id);

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  // const [dimensions, setDimensions] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    if (!parsedManifest) return;

    setRows([
      ...folders.map(f => folderToRow(f)),
      ...canvases.map(c => canvasToRow(c, parsedManifest))
    ]);
  }, [folders, canvases, parsedManifest]);

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

  const nameTemplate = (row: ItemTableRow) => (
    <div>{row.name}</div>
  )

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

  return (
    <div className="mt-12 rounded-md border cursor-pointer">
      {parsedManifest && (
        <DataTable 
          removableSort
          value={rows} 
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
            body={nameTemplate} />

          <Column
            field="dimensions"
            header="Dimensions"
            headerClassName={TABLE_HEADER_CLASS}
            // body={dimensionsTemplate} 
          />

          <Column
            sortable
            sortFunction={sortByLastEdit}
            field="lastEdit" 
            header="Last Edit" 
            headerClassName={TABLE_HEADER_CLASS}
            // body={lastEditTemplate} 
          />

          <Column
            sortable
            sortFunction={sortByAnnotations}
            field="annotations" 
            header="Annotations" 
            headerClassName={TABLE_HEADER_CLASS} 
            // body={annotationsTemplate} 
          />

          <Column 
            field="actions" 
            body={actionsTemplate} />
        </DataTable>
      )}
    </div>
  )

}