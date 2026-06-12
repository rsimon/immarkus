import { ArrowDownNarrowWide, ArrowUpNarrowWide, ChevronDown } from 'lucide-react';
import { SortOrder } from 'primereact/datatable';
import { Sorting } from '@/utils/useImageSorting';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface GridSortingProps {

  allowUnsorted?: boolean;

  sorting: Sorting;

  onChange(sorting?: Sorting): void;

}

const LABELS = {
  'name': 'Name',
  'annotations': 'Annotations',
  undefined: 'Manifest Order'
};

const UNSORTED = 'unsorted';

export const GridSorting = (props: GridSortingProps) => {
  const { allowUnsorted, sorting, onChange } = props;
  
  const isUnsorted = !(sorting?.sortField && sorting?.sortOrder);

  const onSortFieldChange = (sortField: string) => {
    if (sortField === UNSORTED) {
      onChange(undefined);
    } else {
      onChange({ sortOrder: sorting?.sortOrder || 1 as SortOrder, sortField });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex gap-1.5 font-normal rounded items-center focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring ring-offset-2">
        {sorting?.sortOrder === 1 ? (
          <ArrowDownNarrowWide className="size-4" />
        ) : (
          <ArrowUpNarrowWide className="size-4" />
        )}

        {LABELS[sorting?.sortField]}

        <ChevronDown className="shrink-0 size-4 opacity-50" />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={sorting?.sortField || UNSORTED}
          onValueChange={onSortFieldChange}>
          {allowUnsorted && (
            <DropdownMenuRadioItem value={UNSORTED}>
              Manifest order
            </DropdownMenuRadioItem>
          )}

          <DropdownMenuRadioItem value="name">
            Name
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="annotations">
            Annotations
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuRadioGroup
          value={(sorting?.sortOrder || '').toString()}
          onValueChange={value => onChange({ ...sorting, sortOrder: Number(value) as SortOrder })}>
          <DropdownMenuRadioItem 
            value="1"
            className="gap-1.5"
            disabled={isUnsorted}>
            <ArrowDownNarrowWide className="size-4" /> Ascending
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem 
            value="-1"
            className="gap-1.5"
            disabled={isUnsorted}>
            <ArrowUpNarrowWide className="size-4" /> Descending
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}