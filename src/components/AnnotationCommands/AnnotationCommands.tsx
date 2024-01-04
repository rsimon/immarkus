import { useState } from 'react';
import { Cuboid, Spline, Tags } from 'lucide-react';
import { EntityType, Tag } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { EntityTypeEditor } from '../EntityTypeEditor';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/ui/Command';

interface AnnotationCommandProps {

  onAddEntityType(type: EntityType): void;

  onAddTag(tag: Tag): void;

}

export const AnnotationCommands = (props: AnnotationCommandProps) => {

  const { model, addTag } = useDataModel();

  const { entityTypes, tags } = model;

  const [value, setValue] = useState('');

  const isEmpty = (entityTypes.length + tags.length) === 0 && !value;

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
          {isEmpty ? (
            <div className="flex justify-center items-center p-6 text-sm text-muted-foreground">No results</div>
          ) : (
            <>
              <CommandEmpty>
                No results
              </CommandEmpty>

              {entityTypes.length > 0 && (
                <CommandGroup heading="Entities">
                  {entityTypes.map(entity => (
                    <CommandItem key={entity.id} onSelect={() => props.onAddEntityType(entity)}>
                      <Cuboid className="h-4 w-4 mr-2" /> {entity.label || entity.id}
                    </CommandItem>
                  ))}
                </CommandGroup>
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
            </>
          )}
        </CommandList>

        <div className="p-1 pt-1.5 border-t flex justify-end text-muted-foreground">
          <EntityTypeEditor>
            <Button variant="ghost" className="text-xs h-8 px-2 rounded-sm mr-2">
              <Cuboid className="h-3.5 w-3.5 mr-1" /> Create new entity
            </Button>
          </EntityTypeEditor>

          <Button variant="ghost" className="text-xs h-8 px-2 rounded-sm">
            <Spline className="h-3.5 w-3.5 mr-1" /> Create new relation
          </Button>
        </div>
      </Command>
    </div>
  )

}