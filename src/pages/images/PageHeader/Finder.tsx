import { useState } from 'react';
import { FileSearch, Search, X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Switch } from '@/ui/Switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/Popover';

interface FinderProps {

  filterQuery: string;

  hideUnannotated: boolean;

  onChangeFilterQuery(query: string): void;

  onChangeHideUnannotated(hide: boolean): void;

}

export const Finder = (props: FinderProps) => {

  const { filterQuery, hideUnannotated } = props;

  const [open, setOpen] = useState(false);

  const showPip = (filterQuery || hideUnannotated);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="link"
          className="relative text-muted-foreground flex items-center gap-1.5 p-0 h-auto font-normal">
          <FileSearch className="size-4" /> Find

          {showPip && (
            <div className="bg-rose-500 absolute top-0 left-2 rounded-full size-2" />
          )}
        </Button> 
      </PopoverTrigger>

      <PopoverContent 
        align="start"
        className="p-1.5 text-sm w-56">

        <fieldset className="relative">
          <Input 
            className="rounded-sm pl-8" 
            value={filterQuery}
            onChange={evt => props.onChangeFilterQuery(evt.target.value)} />

          <Button 
            variant="link"
            className="p-2 h-full absolute top-0 left-0">
            <Search
              className="size-4" />
          </Button>

          {filterQuery && (
            <Button
              variant="link"
              className="p-2 h-full absolute top-0 right-0"
              onClick={() => props.onChangeFilterQuery('')}>
              <X className="size-4" />
            </Button>
          )}
        </fieldset>

        <fieldset className="p-0.5 pt-2 border-t mt-2.5">
          <div className="flex items-center gap-2 justify-between">
            <Label htmlFor="hide-labels">
              Hide un-annotated
            </Label>

            <Switch 
              checked={hideUnannotated}
              id="hide-labels"
              className="mb-0.5"
              onCheckedChange={props.onChangeHideUnannotated} />
          </div>

          <p className="text-muted-foreground text-xs pt-0.5">
            Don't show thumbnails for images that have no annotations.
          </p>
        </fieldset>
      </PopoverContent>
    </Popover>
  )

}