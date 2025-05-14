import Moment from 'react-moment';
import murmur from 'murmurhash';
import { CozyRange } from 'cozy-iiif';
import { W3CAnnotation } from '@annotorious/react';
import { ColumnSortEvent } from 'primereact/column';
import { Skeleton } from '@/ui/Skeleton';
import { ItemTableRow } from './Types';
import { 
  ArrowDownNarrowWide, 
  ArrowDownWideNarrow, 
  ArrowUpDown, 
  MessagesSquare 
} from 'lucide-react';

export const TABLE_HEADER_CLASS = 'pl-3 pr-2 whitespace-nowrap text-xs text-muted-foreground font-semibold text-left';

export const TABLE_EMPTY_MESSAGE = (
  <div className="flex justify-center p-5 text-muted-foreground/60">
    No data
  </div>
);

export const TABLE_SKELETON = (
  <div className="space-y-3 p-2">
    <Skeleton className="h-1.5 w-96" />
    <Skeleton className="h-1.5 w-80" />
  </div>
)

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

export const NAME_COLUMN_TEMPLATE = (row: ItemTableRow) => (
  <div>{row.name}</div>
);

export const DIMENSIONS_COLUMN_TEMPLATE = (row: ItemTableRow) =>
  row.dimensions ? (
    <span className="text-muted-foreground">
      {row.dimensions[0].toLocaleString()} x{" "}
      {row.dimensions[1].toLocaleString()}
    </span>
  ) : null;

export const LAST_EDIT_COLUMN_TEMPLATE = (row: ItemTableRow) => 
  row.lastEdit ? (
    <Moment fromNow className="text-muted-foreground">
      {row.lastEdit.toISOString()}
    </Moment>
  ) : null;

export const ANNOTATIONS_COLUMN_TEMPLATE = (row: ItemTableRow) => (
  <div className="text-muted-foreground flex justify-around">
    <div>
      <MessagesSquare 
        size={16} 
        className="inline align-text-bottom mr-1.5" 
        strokeWidth={1.8}/> 
      {(row.annotations || 0).toLocaleString()}
    </div>
  </div>
)

export const getAnnotationsInRange = (range: CozyRange, annotations: Record<string, W3CAnnotation[]>): W3CAnnotation[] => {
  // Canvases directly contained in this range
  const annotationsOnCanvases = range.canvases.reduce<W3CAnnotation[]>((agg, canvas) => {
    const id = murmur.v3(canvas.id);
    return [...agg, ...(annotations[id] || [])];
  }, []);

  // Subranges
  const annotationsOnSubRanges = range.ranges.reduce<W3CAnnotation[]>((agg, range) => {
    return [...agg, ...getAnnotationsInRange(range, annotations)]
  }, []);

  return [...annotationsOnCanvases, ...annotationsOnSubRanges];
}
