import murmur from 'murmurhash';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { getDateLocale } from '@/i18n/dateLocale';
import { CozyRange } from 'cozy-iiif';
import { W3CAnnotation } from '@annotorious/react';
import { Skeleton } from '@/ui/Skeleton';
import { Sorting, SortOrder } from '@/utils/useImageSorting';
import { ItemTableRow } from './Types';
import {
  ArrowDownNarrowWide,
  ArrowDownWideNarrow,
  ArrowUpDown,
  MessagesSquare
} from 'lucide-react';

export const TABLE_HEADER_CLASS = 'pl-3 pr-2 whitespace-nowrap text-xs text-muted-foreground font-medium text-left';

const TableEmptyMessage = () => {
  const { t } = useTranslation('images');

  return (
    <div className="flex justify-center p-5 text-muted-foreground/60">
      {t('table.noData')}
    </div>
  );
}

export const TABLE_EMPTY_MESSAGE = (
  <TableEmptyMessage />
);

export const TABLE_SKELETON = (
  <div className="flex gap-8 items-center">
    <Skeleton className="size-10 rounded" />
    <Skeleton className="h-2 w-72" />
  </div>
)

export const renderSortIcon = (active: boolean, order?: SortOrder) => {
  if (!active)
    return (<ArrowUpDown className="size-3.5" />);
  else if (order === 1)
    return (<ArrowDownNarrowWide className="size-3.5" />);
  else
    return (<ArrowDownWideNarrow className="size-3.5" />);
}

interface SortableColumnHeaderProps {

  label: string;

  field: string;

  sorting?: Sorting;

  onSort(sorting?: Sorting): void;

}

// Clickable column header that cycles: unsorted -> ascending -> descending -> unsorted.
export const SortableColumnHeader = (props: SortableColumnHeaderProps) => {
  const { label, field, sorting, onSort } = props;

  const active = sorting?.sortField === field;

  const onClick = () => {
    if (!active)
      onSort({ sortField: field, sortOrder: 1 });
    else if (sorting!.sortOrder === 1)
      onSort({ sortField: field, sortOrder: -1 });
    else
      onSort(undefined);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5">
      {label}
      {renderSortIcon(active, sorting?.sortOrder)}
    </button>
  );
}

const isFolderLike = (row: ItemTableRow) => row.type === 'folder' || row.type === 'manifest';

const compareByName = (a: ItemTableRow, b: ItemTableRow) =>
  a.name.toLowerCase().localeCompare(b.name.toLowerCase());

const compareByLastEdit = (a: ItemTableRow, b: ItemTableRow) => {
  if (a.lastEdit && b.lastEdit)
    return a.lastEdit > b.lastEdit ? -1 : 1;
  else
    return a.lastEdit ? -1 : 1;
}

const compareByAnnotations = (a: ItemTableRow, b: ItemTableRow) =>
  a.annotations - b.annotations;

const COMPARATORS: Record<string, (a: ItemTableRow, b: ItemTableRow) => number> = {
  name: compareByName,
  lastEdit: compareByLastEdit,
  annotations: compareByAnnotations
};

// Sorts rows by the given field/order, keeping folder-like rows (folders, manifests)
// ahead of images regardless of sort direction.
export const sortRows = (rows: ItemTableRow[], sorting?: Sorting): ItemTableRow[] => {
  const comparator = sorting?.sortField && COMPARATORS[sorting.sortField];
  if (!comparator) return rows;

  return [...rows].sort((a, b) => {
    if (isFolderLike(a) !== isFolderLike(b))
      return isFolderLike(a) ? -1 : 1;

    return sorting!.sortOrder * comparator(a, b);
  });
}

export const NAME_COLUMN_TEMPLATE = (row: ItemTableRow) => (
  <div className="truncate">{row.name}</div>
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
    <div className="text-muted-foreground">
      {formatDistanceToNow(row.lastEdit, { addSuffix: true, locale: getDateLocale() })}
    </div>
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

export const sortGridItems = <T extends any>(
  items: T[],
  sorting: Sorting | undefined,
  getAnnotationCount: (item: T) => number,
  getName: (item: T) => string
): T[] => {
  if (!sorting?.sortField || !sorting?.sortOrder)
    return items;

  return [...items].sort((a, b) => {
    if (sorting.sortField === 'name') {
      return sorting.sortOrder * getName(a).localeCompare(getName(b));
    } else if (sorting.sortField === 'annotations') {
      const annotationsA = getAnnotationCount(a);
      const annotationsB = getAnnotationCount(b);
      return (annotationsA - annotationsB) * sorting.sortOrder;
    }
    return 0;
  });
}
