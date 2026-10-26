import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { Command as CommandPrimitive } from 'cmdk';
import { RelationshipType } from '@/model';
import { useDataModel } from '@/store';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { 
  Command, 
  CommandGroup, 
  CommandItem, 
  CommandList 
} from '@/ui/Command';

interface RelationsSelectionControlProps {

  relations: RelationshipType[];

  onChange(relations: RelationshipType[]): void;

}

export const RelationsSelectionControl = (props: RelationsSelectionControlProps) => {
  const { t } = useTranslation('smartTools');

  const model = useDataModel();

  const available = useMemo(() => {
    return model.relationshipTypes.map(r => ({ label: r.name, value: r.name }));
  }, [model.relationshipTypes]);

  const selected = useMemo(() => {
    return available.filter(opt => props.relations.some(rel => rel.name === opt.value));
  }, [available, props.relations]);

  const onChange = (options: FanceMultiSelectOption[]) => {
    const selected = model.relationshipTypes.filter(r => options.some(o => o.value === r.name));
    props.onChange(selected);
  }

  return (
    <div>
      <FancyMultiSelect 
        available={available}
        selected={selected}
        onChange={onChange} 
        placeholder={t('autoAnnotate.controls.selectRelations')} />
      
      <div className="flex justify-end px-1">
        {selected.length > 0 && (
          <Button
            variant="link"
            className="underline font-normal text-muted-foreground hover:text-foreground p-0 h-auto text-[11px]"
            onClick={() => props.onChange([])}>
            {t('annotate.controls.clear')}
          </Button>
        )}
      </div>
    </div>
  )

}

// Based on https://github.com/mxkaske/mxkaske.dev/blob/main/components/craft/fancy-multi-select.tsx (MIT)
export type FanceMultiSelectOption = { value: string; label: string };

interface FancyMultiSelectProps {

  available: FanceMultiSelectOption[];

  selected: FanceMultiSelectOption[];

  placeholder?: string;

  onChange(selected: FanceMultiSelectOption[]): void;

}

const FancyMultiSelect = (props: FancyMultiSelectProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);

  const [inputValue, setInputValue] = useState('');

  const handleUnselect = (option: FanceMultiSelectOption) =>
    props.onChange(props.selected.filter(o => o.value !== option.value));

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (input.value === "") {
          const next = [...props.selected];
          next.pop();
          
          props.onChange(next);        }
      }
      // This is not a default behaviour of the <input /> field
      if (e.key === "Escape") {
        input.blur();
      }
    }
  }

  const selectables = props.available.filter(o => !props.selected.includes(o));

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent">
      <div className="group bg-muted rounded-md border shadow-xs p-1 h-auto text-xs font-light ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        <div className="flex flex-wrap gap-1 px-0 py-0.5">
          {props.selected.map(opt => {
            return (
              <Badge 
                key={opt.value} 
                variant="secondary"
                className="bg-white/90 hover:bg-white/90 border border-black/10 whitespace-nowrap rounded-full inline-flex items-center text-[11px] font-normal gap-1 px-2 py-0.75">
                {opt.label}
                <button
                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(opt);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(opt)}>
                  <X className="size-3 text-muted-foreground" />
                </button>
              </Badge>
            );
          })}
    
          {selectables.length > 0 && (
            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={props.placeholder}
              className="ml-1 flex-1 bg-transparent outline-none placeholder:text-muted-foreground" />
          )}
        </div>
      </div>
      <div className="relative mt-2">
        <CommandList>
          {open && selectables.length > 0 ? (
            <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandGroup className="h-full overflow-auto">
                {selectables.map(opt => {
                  return (
                    <CommandItem
                      key={opt.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        setInputValue("");
                        props.onChange([...props.selected, opt]);
                      }}
                      className={"cursor-pointer"}>
                      {opt.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ) : null}
        </CommandList>
      </div>
    </Command>
  )

}