import { useState } from 'react';
import { Braces, Spline, Tags } from 'lucide-react';
import { useVocabulary } from '@/store';
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
import { EntityDetailsDialog } from '../EntityDetails';
import { Entity, TextTag } from '@/model';

interface AnnotationCommandProps {

  onAddEntity(entity: Entity): void;

  onAddTag(tag: TextTag): void;

}

export const AnnotationCommands = (props: AnnotationCommandProps) => {

  const { vocabulary, addTag } = useVocabulary();

  const { entities, relations, tags } = vocabulary;

  const [value, setValue] = useState('');

  const onCreateNewTag = () => {
    addTag(value);
    props.onAddTag(value);
  }

  return (
    <div>
      <Command 
        loop
        filter={(value, search) =>
          value.replace(/ /g, '').includes(search.toLowerCase().replace(/ /g, '')) ? 1 : 0
        }>

        <CommandInput 
          placeholder="Search or type a new tag" 
          value={value} 
          onValueChange={setValue} />
          
        <CommandList>
          <CommandEmpty>
            No results
          </CommandEmpty>

          {entities.length > 0 && (
            <CommandGroup heading="Entities">
              {entities.map(entity => (
                <CommandItem key={entity.id} onSelect={() => props.onAddEntity(entity)}>
                  <Braces className="h-4 w-4 mr-2" /> {entity.label}
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {relations.length > 0 && (
            <>
              <CommandSeparator />

              <CommandGroup heading="Relations">
                {relations.map(relation => (
                  <CommandItem key={relation.id}>
                    <Spline className="h-4 w-4 mr-2" /> {relation.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {tags.length > 0 || value && (
            <>
              <CommandSeparator />

              <CommandGroup heading="Tags">
                {tags.map(tag => (
                  <CommandItem key={tag} onSelect={() => props.onAddTag(tag)}>
                    <Tags className="h-4 w-4 mr-2" /> {tag}
                  </CommandItem>
                ))}

                {value && (
                  <CommandItem onSelect={onCreateNewTag}>
                    <Tags className="h-4 w-4 mr-2" /> {value}
                  </CommandItem>
                )}
              </CommandGroup>
            </>
          )}
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
    </div>
  )

}