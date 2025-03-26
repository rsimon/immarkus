import { useEffect, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Command, CommandEmpty, CommandItem, CommandList } from '@/ui/Command';
import { Spinner } from '@/components/Spinner';
import { Button } from '@/ui/Button';
import { Popover,PopoverContent, PopoverTrigger } from '@/ui/Popover';
import type { GraphNodeType } from '../../Types';
import { IIIFMetadataIndexRecord, useManifestMetadataSearch } from './useManifestMetadataSearch';

interface IIIFMetadataSearchProps {

  objectType: GraphNodeType;

  value?: IIIFMetadataIndexRecord;
  
  onChange(data: IIIFMetadataIndexRecord): void;

}

export const IIIFMetadataSearch = (props: IIIFMetadataSearchProps) => {

  const { loading, search } = useManifestMetadataSearch(props.objectType);

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState('');

  const [options, setOptions] = useState<IIIFMetadataIndexRecord[]>([]);

  useEffect(() => setOptions(search(query)), [query]);

  const onSelect = (option: IIIFMetadataIndexRecord) => {
    setOpen(false);
    props.onChange(option);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={loading}
          variant="outline"
          role="combobox"
          aria-expanded={options.length > 0}
          className="rounded-none min-w-32 justify-start max-w-40 text-xs font-normal overflow-hidden relative px-2 py-1 h-auto bg-white shadow-none border-l-0 whitespace-nowrap text-ellipsis">
          {loading ? (
            <div className="grow flex justify-center">
              <Spinner className="w-3 h-3 text-muted-foreground" />
            </div>
          ) : props.value ? (
            <div>
              <strong>{props.value.data.label}:</strong> {props.value.data.value}
            </div>
          ) : (
            <div className="grow" />
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="start"
        className="min-w-[80px] max-w-72 w-auto p-0 overflow-hidden">
        <Command>
          <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input 
              className="flex h-auto w-full rounded-md bg-transparent py-3 text-sm outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search..." 
              value={query}
              onChange={evt => setQuery(evt.target.value)} />
          </div>

          <CommandList className="p-1">
            <CommandEmpty 
              className="text-xs font-normal flex justify-center py-2 text-muted-foreground">
              No matches
            </CommandEmpty>

            {options.map(option => (
              <CommandItem 
                key={option.stringified}
                className="block text-xs overflow-hidden whitespace-nowrap text-ellipsis"
                value={JSON.stringify(option)}
                // Warning: cmdk trims the values, possibly breaking them!
                onSelect={() => onSelect(option)}>
                <strong>{option.data.label}</strong>: {option.data.value}
              </CommandItem>
            ))}          
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )

}