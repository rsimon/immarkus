import { useEffect, useState } from 'react';
import { DataTable, DataTableRowClickEvent } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Folder, IIIFManifestResource, Image, LoadedFileImage } from '@/model';
import { isSingleImageManifest } from '@/utils/iiif';
import { ItemOverviewLayoutProps } from '../ItemOverviewLayoutProps';
import { AnnotationMap, ItemTableRow } from '../../Types';
import { ItemTableRowImageThumbnail } from './ItemTableRowImageThumbnail';
import { ItemTableRowActions } from './ItemTableRowActions';
import { ItemTableRowCanvasThumbnail } from './ItemTableRowCanvasThumbnail';
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

const folderToRow = (
  folder: Folder, 
  annotations: AnnotationMap
): ItemTableRow => {
  const annotationsInFolder = annotations.folders[folder.id] || [];

  return {
    data: folder,
    type: 'folder',
    name: folder.name,
    lastEdit: getLastEdit(annotationsInFolder),
    annotations: annotationsInFolder.length
  }
}

const manifestToRow = (
  manifest: IIIFManifestResource, 
  annotations: AnnotationMap
): ItemTableRow => {
  const annotationsInFolder = annotations.folders[`iiif:${manifest.id}`] || [];

  return {
    data: manifest,
    type: 'manifest',
    name: manifest.name,
    lastEdit: getLastEdit(annotationsInFolder),
    annotations: annotationsInFolder.length
  }
}

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
      ...props.folders.map(f => folderToRow(f, props.annotations)),
      ...props.iiifResources.map(r => manifestToRow(r as IIIFManifestResource, props.annotations)),
      ...props.images.map(i => imageToRow(i, props.annotations, dimensions))
    ]);
  }, [props.folders, props.iiifResources, props.images, props.annotations, dimensions]);

  const onLoadDimensions = (image: Image, dimensions: [number, number]) =>
    setDimensions(current => ({...current, [image.id]: dimensions }));

  const typeTemplate = (row: ItemTableRow) => {
    return (
      <div className="pl-2">
        {row.type === 'folder' ? (
          <FolderIcon className="size-10" />
        ) : row.type === 'manifest' && isSingleImageManifest(row.data) ? (
          <ItemTableRowCanvasThumbnail 
            manifest={row.data} />
        ) : row.type === 'manifest' ? (
          <div className="relative">
            <FolderIcon className="size-10" />
            <IIIFIcon
              className="size-4 text-white absolute bottom-1 left-1.5"
              light
            />
          </div>
        ) : (
          <ItemTableRowImageThumbnail
            image={row.data as LoadedFileImage}
            onLoadDimensions={dim => onLoadDimensions(row.data, dim)} />
        )}
      </div>
    );
  };

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
  );
};
