import { useEffect, useState } from 'react';
import { AArrowDown, ArrowDownNarrowWide, ArrowDownWideNarrow, ArrowUpDown, MessagesSquare } from 'lucide-react';
import Moment from 'react-moment';
import { W3CAnnotation } from '@annotorious/react';
import { DataTable, DataTableRowClickEvent } from 'primereact/datatable';
import { Column, ColumnSortEvent } from 'primereact/column';
import { cn } from '@/ui/utils';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Folder, IIIFManifestResource, Image, LoadedFileImage } from '@/model';
import { ItemOverviewLayoutProps } from '../ItemOverviewLayoutProps';
import { AnnotationMap } from '../../Types';
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

export const getLastEdit = (annotations: W3CAnnotation[]): Date | undefined => {
  // Helper
  const getLatestTimestamp = (annotation: W3CAnnotation): Date | undefined => {
    const timestamps: Date[] = [];

    if (annotation.created) timestamps.push(new Date(annotation.created));
    if (annotation.modified) timestamps.push(new Date(annotation.modified));

    const bodies = Array.isArray(annotation.body) ? annotation.body : [annotation.body];
    bodies.forEach(body => {
      if (body.created) timestamps.push(new Date(body.created));
      if (body.modified) timestamps.push(new Date(body.modified));
    });

    return timestamps.length > 0 
      ? new Date(Math.max(...timestamps.map(t => t.getTime())))
      : undefined
  };

  const timestamps = annotations.map(a => getLatestTimestamp(a)).filter(Boolean);
  return timestamps.length > 0 
      ? new Date(Math.max(...timestamps.map(t => t.getTime())))
      : undefined
}

export const ItemTable = (props: ItemOverviewLayoutProps) => {

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  const [dimensions, setDimensions] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    setRows([
      ...props.folders.map(f => folderToRow(f)),
      ...props.iiifResources.map(manifestToRow),
      ...props.images.map(i => imageToRow(i, props.annotations, dimensions)),
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
          <ImageRowThumbnail
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

  // Generic sort helper that applies by-type sorting first, and the provided sort fn second.
  const sort = (evt: ColumnSortEvent, sortFn: (a: ItemTableRow, b: ItemTableRow) => number) => {
    const data = evt.data as ItemTableRow[];

    return [...data].sort((a, b) => {
      const isFolderLike = (row: ItemTableRow) => row.type === 'folder' || row.type === 'manifest';

      if (isFolderLike(a) !== isFolderLike(b))
        return isFolderLike(a) ? -1 : 1;
      
      return evt.order * sortFn(a, b);
    })
  }

  const sortByName = (evt: ColumnSortEvent) =>
    sort(evt, (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

  const sortByLastEdit = (evt: ColumnSortEvent) =>
    sort(evt, (a, b) => a.lastEdit > b.lastEdit ? -1 : 1);

  const sortByAnnotations = (evt: ColumnSortEvent) =>
    sort(evt, (a, b) => a.annotations - b.annotations);

  const sortIcon = (evt: any) => {
    if (!evt.sorted)
      return (<ArrowUpDown className="size-3.5" />)
    else if (evt.sortOrder === 1)
      return (<ArrowDownNarrowWide className="size-3.5" />)
    else 
      return (<ArrowDownWideNarrow className="size-3.5" />)
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
          headerClassName={headerClass}
          body={typeTemplate} />

        <Column 
          sortable
          sortFunction={sortByName}
          field="name" 
          header="Name" 
          headerClassName={headerClass} 
          body={nameTemplate} />

        <Column
          field="dimensions"
          header="Dimensions"
          headerClassName={cn(headerClass)}
          body={dimensionsTemplate} />

        <Column
          sortable
          sortFunction={sortByLastEdit}
          field="lastEdit" 
          header="Last Edit" 
          headerClassName={headerClass}
          body={lastEditTemplate} />

        <Column
          sortable
          sortFunction={sortByAnnotations}
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
