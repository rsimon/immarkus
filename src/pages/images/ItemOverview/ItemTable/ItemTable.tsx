import { useEffect, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { DataTable, DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Store, useStore } from '@/store';
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

  contains?: {

    canvases?: number;
    
    images?: number;
    
    subfolders?: number;

  }

}

const headerClass = 'pl-3 pr-2 whitespace-nowrap text-xs text-muted-foreground font-semibold text-left';

const folderToRow = (folder: Folder, store: Store): ItemTableRow => {
  const { images, folders } = store.getFolderContents(folder.handle);

  return {
    data: folder,
    type: 'folder',
    name: folder.name,
    contains: {
      images: images.length,
      subfolders: folders.length
    }
  }
}

const manifestToRow = (manifest: IIIFManifestResource): ItemTableRow => ({
  data: manifest,
  type: 'manifest',
  name: manifest.name,
  contains: {
    canvases: manifest.canvases.length
  }
});

const imageToRow = (
  image: Image, 
  annotationCounts: Record<string, number>,
  dimensions: Record<string, [number, number]>
): ItemTableRow => ({
  data: image,
  type: 'image',
  name: image.name,
  dimensions: dimensions[image.id],
  annotations: annotationCounts[image.id] || 0
});

export const ItemTable = (props: ItemOverviewLayoutProps) => {

  const store = useStore();

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  const [dimensions, setDimensions] = useState<Record<string, [number, number]>>({});

  useEffect(() => {
    setRows([
      ...props.folders.map(f => folderToRow(f, store)),
      ...props.iiifResources.map(manifestToRow),
      ...props.images.map(i => imageToRow(i, props.annotationCounts, dimensions)),
    ]);
  }, [props.folders, props.iiifResources, props.images, props.annotationCounts, dimensions]);

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

  const dimensionsTemplate = (row: ItemTableRow) =>
    row.dimensions ? (
      <span className="text-muted-foreground">
        {row.dimensions[0].toLocaleString()} x{" "}
        {row.dimensions[1].toLocaleString()}
      </span>
    ) : null;

  const containsTemplate = (row: ItemTableRow) => {
    if (!row.contains) return null;

    const { images, subfolders, canvases } = row.contains;
    if (!isNaN(canvases)) {
      return (
        <span className="text-muted-foreground">
          {`${canvases.toLocaleString()} Canvas${canvases === 1 ? '' : 'es'}`}
        </span>
      )
    } else {
      return (
        <span className="text-muted-foreground">
          {images === 0 && subfolders === 0 ? 
            'Empty' : 
            images > 0 && subfolders > 0 ?
              `${images} Image${images > 1 ? 's' : ''} · ${subfolders} Subfolder${subfolders > 1 ? 's' : ''}` :
            images > 0 ?
              `${images} Image${images > 1 ? 's' : ''}` :
              `${subfolders} Subfolder${subfolders > 1 ? 's' : ''}`
          }
        </span>
      )
    }
  }

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
          headerClassName={headerClass} 
          body={containsTemplate} />

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
