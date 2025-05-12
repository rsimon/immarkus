import { useEffect, useState } from 'react';
import { FolderIcon } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Folder, IIIFManifestResource, Image, LoadedFileImage } from '@/model';
import { ItemOverviewLayoutProps } from '../ItemOverviewLayoutProps';
import { ImageRowThumbnail } from './ImageRowThumbnail';

import './ItemTable.css';

interface ItemTableRow {

  data: any;

  type: 'folder' | 'manifest' | 'image';

  name: string;

  dimensions?: [number, number];

}

const folderToRow = (folder: Folder): ItemTableRow => ({
  data: folder,
  type: 'folder',
  name: folder.name
});

const manifestToRow = (manifest: IIIFManifestResource): ItemTableRow => ({
  data: manifest,
  type: 'manifest',
  name: manifest.name
});

const imageToRow = (image: Image): ItemTableRow => ({
  data: image,
  type: 'image',
  name: image.name
});

export const ItemTable = (props: ItemOverviewLayoutProps) => {

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  useEffect(() => {
    setRows([
      ...props.folders.map(folderToRow),
      ...props.iiifResources.map(manifestToRow),
      ...props.images.map(imageToRow)
    ]);
  }, [props.folders, props.iiifResources, props.images]);

  const onLoadDimensions = (image: Image, dimensions: [number, number]) => 
    setRows(current => current.map(r => r.data === image ? ({...r, dimensions }) : r));

  const typeTemplate = (row: ItemTableRow) => {
    return (
      <div className="pl-2">
        {row.type === 'folder' ? (
          <FolderIcon className="size-5" />
        ) : row.type === 'manifest' ? (
          <IIIFIcon className="size-5" light />
        ) : (
          <ImageRowThumbnail 
            image={row.data as LoadedFileImage} 
            onLoadDimensions={dim => onLoadDimensions(row.data, dim)} />
        )}
      </div>
    )
  };

  const dimensionsTemplate = (row: ItemTableRow) => 
    row.dimensions ? (
      <span>{row.dimensions[0].toLocaleString()} x {row.dimensions[1].toLocaleString()}</span>
    ) : null;

  return (
    <div className="pt-8">
      <DataTable value={rows} stripedRows>
        <Column field="type" header="Type" body={typeTemplate} />
        <Column field="name" header="Name" />
        <Column field="dimensions" header="Dimensions" body={dimensionsTemplate} />
        <Column field="contains" header="Contains" />
        <Column field="annotations" header="Annotations" />
        <Column field="actions" />
      </DataTable>
    </div>
  )

}