import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { Button } from '@/ui/Button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface EntityTypeActionsProps {

  onEditEntityType(): void;

  onDeleteEntityType(): void;

}

export const EntityTypeActions = (props: EntityTypeActionsProps) => {

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent sideOffset={-10}>
          <DropdownMenuItem className="text-xs" onSelect={props.onEditEntityType}>
            <Pencil size={16} className="inline text-muted-foreground relative -top-px mr-2" />Edit Entity
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>
            <Trash2 size={16} className="inline text-red-400 text-xs relative -top-px mr-2" />
            <span className="text-red-500">Delete Entity</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        label="This action will delete the entity from the vocabulary. Existing annotations will not be affected."
        onConfirm={props.onDeleteEntityType}
        onOpenChange={setConfirmDelete} />
    </>
  )

}