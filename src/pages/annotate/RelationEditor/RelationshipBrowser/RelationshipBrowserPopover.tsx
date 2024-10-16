import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ImageAnnotation } from '@annotorious/react';
import { RelationshipType } from '@/model';
import { Button } from '@/ui/Button';
import { RelationshipBrowser } from './RelationshipBrowser';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/ui/Popover';

interface RelationshipBrowserPopoverProps {

  source: ImageAnnotation;

  target?: ImageAnnotation;

  relation?: RelationshipType;

  onChange(relation: RelationshipType): void;

}

export const RelationshipBrowserPopover = (props: RelationshipBrowserPopoverProps) => {

  const { source, target } = props;

  const [open, setOpen] = useState(false);

  const onSelect = (relation: RelationshipType) => {
    setOpen(false);
    props.onChange(relation);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={!target}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-56 text-xs font-normal justify-between overflow-hidden relative">
          <span className="overflow-hidden text-ellipsis whitespace-nowrap">
            {props.relation ? props.relation.name : ''}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="start"
        className="w-56 p-0 overflow-hidden">
        <RelationshipBrowser 
          source={source}
          target={target} 
          relation={props.relation}
          onSelect={onSelect} />
      </PopoverContent>
    </Popover>
  )

}