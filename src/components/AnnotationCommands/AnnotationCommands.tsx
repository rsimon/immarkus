import { useState } from 'react';
import { Braces, Spline, Tags } from 'lucide-react';
import { Button } from '@/ui/Button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/ui/Command';
import { EntityDetailsDialog } from '../EntityDetails/EntityDetailsDialog';

export const AnnotationCommands = () => {

  const [value, setValue] = useState('');

  const createNewTag = () => {
    console.log('new tag', value);
  }

  return (
    <Command>
      <CommandInput 
        placeholder="Search or type a new tag" 
        value={value} 
        onValueChange={setValue} />
        
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Entities">
          <CommandItem>
            <Braces className="h-4 w-4 mr-2" /> Bridge
          </CommandItem>

          <CommandItem>
            <Braces className="h-4 w-4 mr-2" /> Tower
          </CommandItem>

          <CommandItem>
            <Braces className="h-4 w-4 mr-2" /> Gate
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Relations">
          <CommandItem>
            <Spline className="h-4 w-4 mr-2" /> is part of
          </CommandItem>

          <CommandItem>
            <Spline className="h-4 w-4 mr-2" /> is inside
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Tags">
          {value && (
            <CommandItem onSelect={createNewTag}>
              <Tags className="h-4 w-4 mr-2" /> {value}
            </CommandItem>
          )}
        </CommandGroup>
      </CommandList>

      <div className="p-1 pt-1.5 border-t flex justify-end text-muted-foreground">
        <EntityDetailsDialog>
          <Button variant="ghost" className="text-xs h-8 px-2 rounded-sm mr-2">
            <Braces className="h-3.5 w-3.5 mr-1" /> Create new entity
          </Button>
        </EntityDetailsDialog>

        <Button variant="ghost" className="text-xs h-8 px-2 rounded-sm">
          <Spline className="h-3.5 w-3.5 mr-1" /> Create new relation
        </Button>
      </div>
    </Command>
  )

}