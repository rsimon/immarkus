import { ArrowDownNarrowWide, ArrowUpNarrowWide, ChevronDown } from 'lucide-react';
import { Sorting } from '@/utils/useImageSorting';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuRadioGroup, 
  DropdownMenuRadioItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';
import { SortOrder } from 'primereact/datatable';

interface GridSortingProps {

  sorting: Sorting;

  onChange(sorting:Sorting): void;

}

const LABELS = {
  'name': 'Name',
  'annotations': 'Annotations',
  undefined: 'Unsorted'
};

export const GridSorting = (props: GridSortingProps) => {
  const { sorting, onChange } = props;

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
          value={sorting?.sortField}
          onValueChange={sortField => 
            onChange({ sortOrder: sorting?.sortOrder || 1 as SortOrder, sortField })}>
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
            className="gap-1.5">
            <ArrowDownNarrowWide className="size-4" /> Ascending
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem 
            value="-1"
            className="gap-1.5">
            <ArrowUpNarrowWide className="size-4" /> Descending
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}