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

interface RelationshipListItemActionsProps {

  onEdit(): void;

  onDelete(): void;

}

export const RelationshipListItemActions = (props: RelationshipListItemActionsProps) => {

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
          <DropdownMenuItem className="text-xs" onSelect={props.onEdit}>
            <Pencil size={16} className="inline text-muted-foreground relative -top-px mr-2" />Edit
          </DropdownMenuItem>

          <DropdownMenuItem className="text-xs" onSelect={() => setConfirmDelete(true)}>
            <Trash2 size={16} className="inline text-red-400 relative -top-px mr-2" />
            <span className="text-red-500">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        label="This action will delete the relationship type from your data model."
        onConfirm={props.onDelete}
        onOpenChange={setConfirmDelete} />
    </>
  )

}