import { useState } from 'react';
import { ArrowUp, ArrowDown, MoreHorizontal, Pencil, X } from 'lucide-react';
import { PropertyDefinition } from '@/model';
import { Button } from '@/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';
import { PropertyDialog } from './PropertyDialog';

interface EntitySchemaPropActionsProps {

  property: PropertyDefinition;

  onMoveUp(): void;

  onMoveDown(): void;

  onUpdateProperty(updated: PropertyDefinition): void;

  onDeleteProperty(): void;

}

export const EntitySchemaPropActions = (props: EntitySchemaPropActionsProps) => {  

  const [open, setOpen] = useState(false);

  const andClose = (fn: Function) => () => {
    setOpen(false);
    fn();
  }

  const onUpdated = (updated: PropertyDefinition) => {
    setOpen(false);
    props.onUpdateProperty(updated);
  }

  return (
    <DropdownMenu open={open}>
      <DropdownMenuTrigger asChild>
        <Button 
          onClick={() => setOpen(!open)}
          variant="ghost" 
          size="icon" 
          className="h-5 w-5 text-muted-foreground hover:text-black rounded-full">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        onEscapeKeyDown={() => setOpen(false)}
        onPointerDownOutside={() =>setOpen(false)}>
        <DropdownMenuItem onSelect={andClose(props.onMoveUp)}>
          <ArrowUp className="h-4 w-4 mr-2 text-muted-foreground" /> Move up
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={andClose(props.onMoveDown)}>
          <ArrowDown className="h-4 w-4 mr-2 text-muted-foreground" /> Move down
        </DropdownMenuItem>

        <PropertyDialog
          property={props.property}
          onUpdate={onUpdated}>

          <DropdownMenuItem>
            <Pencil className="h-4 w-4 mr-2 text-muted-foreground" /> Edit
          </DropdownMenuItem>
        </PropertyDialog>

        <DropdownMenuItem onSelect={andClose(props.onDeleteProperty)}>
          <X className="h-4 w-4 mr-2 text-muted-foreground" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

}