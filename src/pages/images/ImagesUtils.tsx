import { ArrowDownNarrowWide, ArrowDownWideNarrow, ArrowUpDown } from 'lucide-react';
import { ColumnSortEvent } from 'primereact/column';
import { ItemTableRow } from './Types';
import { W3CAnnotation } from '@annotorious/react';

export const TABLE_HEADER_CLASS = 'pl-3 pr-2 whitespace-nowrap text-xs text-muted-foreground font-semibold text-left';

export const sortIcon = (evt: any) => {
  if (!evt.sorted)
    return (<ArrowUpDown className="size-3.5" />)
  else if (evt.sortOrder === 1)
    return (<ArrowDownNarrowWide className="size-3.5" />)
  else 
    return (<ArrowDownWideNarrow className="size-3.5" />)
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

export const sortByName = (evt: ColumnSortEvent) =>
  sort(evt, (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

export const sortByLastEdit = (evt: ColumnSortEvent) =>
  sort(evt, (a, b) => a.lastEdit > b.lastEdit ? -1 : 1);

export const sortByAnnotations = (evt: ColumnSortEvent) =>
  sort(evt, (a, b) => a.annotations - b.annotations);

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