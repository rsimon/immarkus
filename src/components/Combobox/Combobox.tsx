import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/ui/utils';
import { Button } from '@/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/ui/Command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/Popover';

export interface ComboboxOption {

  value: string; 

  label: string;

}
 
interface ComboboxProps {

  className?: string;

  placeholder?: string;

  value?: string;
  
  options: ComboboxOption[];

  onChange(value: string): void;

}

export const Combobox = (props: ComboboxProps) => {

  const { value, options, placeholder } = props;

  const [open, setOpen] = useState(false);

  const onSelect = (value: string) => {
    setOpen(false);
    props.onChange(value);
  }
 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(props.className, 'text-xs font-normal justify-between overflow-hidden')}>
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {value
              ? options.find(o => o.value === value)?.label
              : placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="start"
        className="min-w-[80px] w-auto p-0 overflow-hidden">
        <Command>
          <CommandInput 
            className="h-auto py-2 text-xs"
            placeholder="Search..." />
          
          <CommandList className="p-1">
            <CommandEmpty 
              className="text-xs font-normal flex justify-center py-2 text-muted-foreground">
              No matches
            </CommandEmpty>

            {props.options.map(option => (
              <CommandItem 
                key={option.value}
                className="block text-xs overflow-hidden whitespace-nowrap text-ellipsis"
                value={option.value}
                // Warning: cmdk trims the values, possibly breaking them!
                onSelect={() => onSelect(option.value)}>
                {option.label}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

}