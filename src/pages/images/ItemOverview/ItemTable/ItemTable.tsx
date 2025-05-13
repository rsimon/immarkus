import { useEffect, useState } from 'react';
import Moment from 'react-moment';
import { MessagesSquare } from 'lucide-react';
import { DataTable, DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Folder, IIIFManifestResource, Image, LoadedFileImage } from '@/model';
import { ItemOverviewLayoutProps } from '../ItemOverviewLayoutProps';
import { AnnotationMap, ItemTableRow } from '../../Types';
import { ItemTableRowThumbnail } from './ItemTableRowThumbnail';
import { ItemTableRowActions } from './ItemTableRowActions';
import { 
  getLastEdit, 
  sortByAnnotations, 
  sortByLastEdit, 
  sortByName, 
  sortIcon, 
  TABLE_HEADER_CLASS 
} from '../../ImagesUtils';

const folderToRow = (folder: Folder): ItemTableRow => {
  return {
    data: folder,
    type: 'folder',
    name: folder.name
  }
}

const manifestToRow = (manifest: IIIFManifestResource): ItemTableRow => ({
  data: manifest,
  type: 'manifest',
  name: manifest.name
});

const imageToRow = (
  image: Image, 
  annotations: AnnotationMap,
  dimensions: Record<string, [number, number]>
): ItemTableRow => ({
  data: image,
  type: 'image',
  name: image.name,
  dimensions: dimensions[image.id],
  lastEdit: getLastEdit((annotations.images[image.id] || [])),
  annotations: (annotations.images[image.id] || []).length
});

export const ItemTable = (props: ItemOverviewLayoutProps) => {

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  const [dimensions, setDimensions] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    setRows([
      ...props.folders.map(f => folderToRow(f)),
      ...props.iiifResources.map(manifestToRow),
      ...props.images.map(i => imageToRow(i, props.annotations, dimensions))
    ]);
  }, [props.folders, props.iiifResources, props.images, props.annotations, dimensions]);

  const onLoadDimensions = (image: Image, dimensions: [number, number]) =>
    setDimensions(current => ({...current, [image.id]: dimensions }));

  const typeTemplate = (row: ItemTableRow) => {
    return (
      <div className="pl-2">
        {row.type === "folder" ? (
          <FolderIcon className="size-10" />
        ) : row.type === "manifest" ? (
          <div className="relative">
            <FolderIcon className="size-10" />
            <IIIFIcon
              className="size-4 text-white absolute bottom-1 left-1.5"
              light
            />
          </div>
        ) : (
          <ItemTableRowThumbnail
            image={row.data as LoadedFileImage}
            onLoadDimensions={dim => onLoadDimensions(row.data, dim)}
          />
        )}
      </div>
    );
  };

  const nameTemplate = (row: ItemTableRow) => (
    <div>{row.name}</div>
  )

  const dimensionsTemplate = (row: ItemTableRow) =>
    row.dimensions ? (
      <span className="text-muted-foreground">
        {row.dimensions[0].toLocaleString()} x{" "}
        {row.dimensions[1].toLocaleString()}
      </span>
    ) : null;

  const lastEditTemplate = (row: ItemTableRow) => 
    row.lastEdit ? (
      <Moment fromNow className="text-muted-foreground">
        {row.lastEdit.toISOString()}
      </Moment>
    ) : null;

  const annotationsTemplate = (row: ItemTableRow) => 
    row.type === 'image' ? (
      <div className="text-muted-foreground flex justify-around">
        <div>
          <MessagesSquare 
            size={16} 
            className="inline align-text-bottom mr-1.5" 
            strokeWidth={1.8}/> 
          {(row.annotations || 0).toLocaleString()}
        </div>
      </div>
    ) : null;

  const actionsTemplate = (row: ItemTableRow) => (
    <ItemTableRowActions 
      data={row.data} 
      onOpenFolder={props.onOpenFolder}
      onSelectFolder={props.onSelectFolder} 
      onSelectImage={props.onSelectImage}
      onSelectManifest={props.onSelectManifest} />
  );

  const onRowClick = (evt: DataTableRowClickEvent) => {
    const { type, data } = evt.data as ItemTableRow;
    if (type === 'folder' || type === 'manifest')
      props.onOpenFolder(data);
    else if (type === 'image')
      props.onOpenImage(data);
  }

  return (
    <div className="mt-12 rounded-md border cursor-pointer">
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
          body={dimensionsTemplate} />

        <Column
          sortable
          sortFunction={sortByLastEdit}
          field="lastEdit" 
          header="Last Edit" 
          headerClassName={TABLE_HEADER_CLASS}
          body={lastEditTemplate} />

        <Column
          sortable
          sortFunction={sortByAnnotations}
          field="annotations" 
          header="Annotations" 
          headerClassName={TABLE_HEADER_CLASS} 
          body={annotationsTemplate} />

        <Column 
          field="actions" 
          body={actionsTemplate} />
      </DataTable>
    </div>
  );
};
