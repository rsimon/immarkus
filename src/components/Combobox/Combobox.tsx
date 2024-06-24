import { useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
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

}

 
export const Combobox = (props: ComboboxProps) => {

  const { value, options, placeholder } = props;

  const [open, setOpen] = useState(false);
 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={props.className}>
          {value
            ? options.find(o => o.value === value)?.label
            : placeholder }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search framework..." />
          
          <CommandList>
            <CommandEmpty>No framework found.</CommandEmpty>
            <CommandItem>Foo</CommandItem>
            <CommandItem>Bar</CommandItem>
            <CommandItem>Baz</CommandItem>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}