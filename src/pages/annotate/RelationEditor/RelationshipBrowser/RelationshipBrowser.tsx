import { Button } from '@/ui/Button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/Popover';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface RelationshipBrowserProps {

  disabled?: boolean;

  placeholder?: string;

  value?: string;

}

export const RelationshipBrowser = (props: RelationshipBrowserProps) => {

  const { disabled, placeholder, value } = props;

  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-56 text-xs font-normal justify-between overflow-hidden relative">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {value
              ? value
              : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="start"
        className="w-56 p-2 overflow-hidden">

        TODO

      </PopoverContent>
    </Popover>
  )

}