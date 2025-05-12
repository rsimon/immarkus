import { useEffect, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { DataTable, DataTableCellClickEvent, DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { cn } from '@/ui/utils';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Folder, IIIFManifestResource, Image, LoadedFileImage } from '@/model';
import { ItemOverviewLayoutProps } from '../ItemOverviewLayoutProps';
import { ImageRowThumbnail } from './ImageRowThumbnail';
import { ItemTableRowActions } from './ItemTableRowActions';

import './ItemTable.css';

interface ItemTableRow {

  data: any;

  type: 'folder' | 'manifest' | 'image';

  name: string;

  dimensions?: [number, number];

  annotations?: number;

  lastEdit?: Date;

}

const headerClass = 'pl-3 pr-2 whitespace-nowrap text-xs text-muted-foreground font-semibold text-left';

export const ItemTable = (props: ItemOverviewLayoutProps) => {

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  const folderToRow = (folder: Folder): ItemTableRow => ({
    data: folder,
    type: 'folder',
    name: folder.name,
  });

  const manifestToRow = (manifest: IIIFManifestResource): ItemTableRow => ({
    data: manifest,
    type: 'manifest',
    name: manifest.name,
  });

  const imageToRow = (image: Image): ItemTableRow => ({
    data: image,
    type: 'image',
    name: image.name,
    annotations: props.annotationCounts[image.id] || 0
  });

  useEffect(() => {
    setRows([
      ...props.folders.map(folderToRow),
      ...props.iiifResources.map(manifestToRow),
      ...props.images.map(imageToRow),
    ]);
  }, [props.folders, props.iiifResources, props.images]);

  const onLoadDimensions = (image: Image, dimensions: [number, number]) =>
    setRows((current) =>
      current.map((r) => (r.data === image ? { ...r, dimensions } : r)),
    );

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
          <ImageRowThumbnail
            image={row.data as LoadedFileImage}
            onLoadDimensions={dim => onLoadDimensions(row.data, dim)}
          />
        )}
      </div>
    );
  };

  const dimensionsTemplate = (row: ItemTableRow) =>
    row.dimensions ? (
      <span className="text-muted-foreground">
        {row.dimensions[0].toLocaleString()} x{" "}
        {row.dimensions[1].toLocaleString()}
      </span>
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
        value={rows} 
        sortMode="multiple"
        onRowClick={onRowClick}>
        <Column
          field="type" 
          header="Type" 
          headerClassName={headerClass}
          body={typeTemplate} />

        <Column 
          sortable
          field="name" 
          header="Name" 
          headerClassName={headerClass} />

        <Column
          field="dimensions"
          header="Dimensions"
          headerClassName={cn(headerClass)}
          body={dimensionsTemplate} />

        <Column 
          field="contains" 
          header="Contains" 
          headerClassName={headerClass} />

        <Column
          field="lastEdit" 
          header="Last Edit" 
          headerClassName={headerClass} />

        <Column
          sortable
          field="annotations" 
          header="Annotations" 
          headerClassName={headerClass} 
          body={annotationsTemplate} />

        <Column 
          field="actions" 
          body={actionsTemplate} />
      </DataTable>
    </div>
  );
};
