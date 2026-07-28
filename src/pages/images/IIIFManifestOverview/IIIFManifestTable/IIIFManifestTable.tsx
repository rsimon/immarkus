import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import murmur from 'murmurhash';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { W3CAnnotation } from '@annotorious/react';
import { CozyManifest, CozyRange } from 'cozy-iiif';
import { FolderIcon } from '@/components/FolderIcon';
import { IIIFIcon } from '@/components/IIIFIcon';
import { CanvasInformation } from '@/model';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { getLastEdit } from '@/utils/annotation';
import { Sorting } from '@/utils/useImageSorting';
import { cn } from '@/ui/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/Table';
import { IIIFManifestOverviewLayoutProps } from '../IIIFManifestOverviewLayoutProps';
import { CanvasItem, ItemTableRow } from '../../Types';
import { IIIFManifestTableRowThumbnail } from './IIIFManifestTableRowThumbnail';
import { IIIFManifestTableRowActions } from './IIIFManifestTableRowActions';
import {
  ANNOTATIONS_COLUMN_TEMPLATE,
  DIMENSIONS_COLUMN_TEMPLATE,
  getAnnotationsInRange,
  LAST_EDIT_COLUMN_TEMPLATE,
  NAME_COLUMN_TEMPLATE,
  SortableColumnHeader,
  sortRows,
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

  const { t } = useTranslation('images');

  const { annotations, canvases, folders, hideUnannotated } = props;

  const [ queryParams ] = useSearchParams();

  const parsedManifest = useIIIFResource(props.manifest.id);

  const [rows, setRows] = useState<ItemTableRow[]>([]);

  const [sorting, setSorting] = useState<Sorting | undefined>();

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

  const sortedRows = useMemo(() => sortRows(filteredRows, sorting), [filteredRows, sorting]);

  useLayoutEffect(() => {
    const canvasId = queryParams.get('canvas');
    if (!canvasId) return;

    setTimeout(() => {
      const target = Array.from(document.getElementsByClassName(canvasId))[0];
      if (target)
        target.scrollIntoView({ block: 'center' });
    }, 1);
  }, [queryParams]);

  const typeTemplate = useCallback((row: ItemTableRow) => {
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
            item={item} />
        )}
      </div>
    );
  }, []);

  const actionsTemplate = useCallback((row: ItemTableRow) => (
    <IIIFManifestTableRowActions
      manifest={props.manifest}
      data={row.data}
      onSelectCanvas={props.onSelect}
      onOpenCanvas={item => props.onOpenCanvas(item.canvas)}
      onAddToWorkspace={item => props.onAddToWorkspace(item.canvas)} />
  ), [props.manifest, props.onSelect, props.onOpenCanvas, props.onAddToWorkspace]);

  const onRowClick = useCallback((row: ItemTableRow) => {
    const { type, data } = row;
    if (type === 'folder')
      props.onOpenRange(data);
    else if (type === 'image')
      props.onOpenCanvas(data.canvas);
  }, [props.onOpenRange, props.onOpenCanvas]);

  const rowClassName = (row: ItemTableRow) => {
    if (row.type === 'folder') return undefined;
    return murmur.v3(row.data.canvas.id).toString()
  }

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
          onSort={setSorting} />
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
          onSort={setSorting} />
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
          onSort={setSorting} />
      ),
      cell: ({ row }) => ANNOTATIONS_COLUMN_TEMPLATE(row.original)
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => actionsTemplate(row.original)
    }
  ], [t, sorting, typeTemplate, actionsTemplate]);

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
                {props.loading ? TABLE_SKELETON : TABLE_EMPTY_MESSAGE}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map(row => (
              <TableRow
                key={row.id}
                className={rowClassName(row.original)}
                onClick={() => onRowClick(row.original)}>
                {row.getVisibleCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    className={cn('overflow-hidden text-ellipsis whitespace-nowrap px-2 py-2', columnClassName(cell.column.id))}>
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

});
