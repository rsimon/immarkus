import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { Folder, IIIFManifestResource, Image, LoadedFileImage } from '@/model';
import { isSingleImageManifest } from '@/utils/iiif';
import { getLastEdit } from '@/utils/annotation';
import { useImageSorting } from '@/utils/useImageSorting';
import { cn } from '@/ui/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/Table';
import { ItemOverviewLayoutProps } from '../ItemOverviewLayoutProps';
import { AnnotationMap, ItemTableRow } from '../../Types';
import { ItemTableRowImageThumbnail } from './ItemTableRowImageThumbnail';
import { ItemTableRowActions } from './ItemTableRowActions';
import { ItemTableRowCanvasThumbnail } from './ItemTableRowCanvasThumbnail';
import {
  ANNOTATIONS_COLUMN_TEMPLATE,
  DIMENSIONS_COLUMN_TEMPLATE,
  LAST_EDIT_COLUMN_TEMPLATE,
  NAME_COLUMN_TEMPLATE,
  SortableColumnHeader,
  sortRows,
  TABLE_EMPTY_MESSAGE,
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

  const { t } = useTranslation('images');

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  const { sorting, onSort } = useImageSorting();

  const [dimensions, setDimensions] = useState<Record<string, [number, number]>>({});

  const filteredRows = useMemo(() => (
    props.hideUnannotated ? rows.filter(r => r.annotations > 0) : rows
  ), [rows, props.hideUnannotated]);

  const sortedRows = useMemo(() => sortRows(filteredRows, sorting), [filteredRows, sorting]);

  useEffect(() => {
    setRows([
      ...props.folders.map(f => folderToRow(f, props.annotations)),
      ...props.iiifResources.map(r => manifestToRow(r as IIIFManifestResource, props.annotations)),
      ...props.images.map(i => imageToRow(i, props.annotations, dimensions))
    ]);
  }, [props.folders, props.iiifResources, props.images, props.annotations, dimensions]);

  const onLoadDimensions = useCallback((image: Image, dimensions: [number, number]) =>
    setDimensions(current => ({...current, [image.id]: dimensions })), []);

  const typeTemplate = useCallback((row: ItemTableRow) => {
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
  }, [onLoadDimensions]);

  const actionsTemplate = useCallback((row: ItemTableRow) => (
    <ItemTableRowActions
      data={row.data}
      onOpenFolder={props.onOpenFolder}
      onOpenImage={props.onOpenImage}
      onAddToWorkspace={props.onAddToWorkspace}
      onSelectFolder={props.onSelectFolder}
      onSelectImage={props.onSelectImage}
      onSelectItem={props.onSelectItem} />
  ), [props.onOpenFolder, props.onOpenImage, props.onAddToWorkspace, props.onSelectFolder, props.onSelectImage, props.onSelectItem]);

  const onRowClick = useCallback((row: ItemTableRow) => {
    const { type, data } = row;
    if (type === 'folder') {
      props.onOpenFolder(data);
    } else if (type === 'manifest') {
      if (isSingleImageManifest(data)) {
        const info = data.canvases[0];
        props.onOpenImage(`iiif:${info.manifestId}:${info.id}`);
      } else {
        props.onOpenFolder(data);
      }
    } else if (type === 'image') {
      props.onOpenImage(data.id);
    }
  }, [props.onOpenFolder, props.onOpenImage]);

  const columns: ColumnDef<ItemTableRow>[] = useMemo(() => [
    {
      id: 'type',
      header: t('table.type'),
      cell: ({ row }) => typeTemplate(row.original)
    },
    {
      id: 'name',
      header: () => (
        <SortableColumnHeader
          label={t('table.name')}
          field="name"
          sorting={sorting}
          onSort={onSort} />
      ),
      cell: ({ row }) => NAME_COLUMN_TEMPLATE(row.original)
    },
    {
      id: 'dimensions',
      header: t('table.dimensions'),
      cell: ({ row }) => DIMENSIONS_COLUMN_TEMPLATE(row.original)
    },
    {
      id: 'lastEdit',
      header: () => (
        <SortableColumnHeader
          label={t('table.lastEdit')}
          field="lastEdit"
          sorting={sorting}
          onSort={onSort} />
      ),
      cell: ({ row }) => LAST_EDIT_COLUMN_TEMPLATE(row.original)
    },
    {
      id: 'annotations',
      header: () => (
        <SortableColumnHeader
          label={t('table.annotations')}
          field="annotations"
          sorting={sorting}
          onSort={onSort} />
      ),
      cell: ({ row }) => ANNOTATIONS_COLUMN_TEMPLATE(row.original)
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => actionsTemplate(row.original)
    }
  ], [t, sorting, onSort, typeTemplate, actionsTemplate]);

  const table = useReactTable({
    data: sortedRows,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const columnClassName = (columnId: string) => cn(
    columnId === 'name' && 'w-[60%]',
    (columnId === 'dimensions' || columnId === 'lastEdit' || columnId === 'annotations') && 'text-center',
    columnId === 'actions' && 'text-right'
  );

  return (
    <div className="mt-12 rounded-md border cursor-pointer">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header, idx) => (
                <TableHead
                  key={header.id}
                  className={cn(TABLE_HEADER_CLASS, columnClassName(header.column.id), idx === 0 && 'pl-4')}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                {TABLE_EMPTY_MESSAGE}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                onClick={() => onRowClick(row.original)}>
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    className={cn('overflow-hidden text-xs text-ellipsis whitespace-nowrap px-2 py-2', columnClassName(cell.column.id))}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

}
