import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/ui/Button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { useState } from 'react';

interface EntityActionsProps {

  onEditEntity(): void;

  onDeleteEntity(): void;

}

export const EntityActions = (props: EntityActionsProps) => {

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem onSelect={props.onEditEntity}>
            <Pencil size={16} className="inline text-muted-foreground relative -top-px mr-2" />Edit Entity
          </DropdownMenuItem>


          <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>
            <Trash2 size={16} className="inline text-red-400 relative -top-px mr-2" />
            <span className="text-red-500">Delete Entity</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        label="This action will delete the entity from the vocabulary. Existing annotations will not be affected."
        onConfirm={props.onDeleteEntity}
        onOpenChange={setConfirmDelete} />
    </>
  )

}