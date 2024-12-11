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

interface MetadataTableActionsProps {

  onEditSchema(): void;

  onDeleteSchema(): void;

}

export const MetadataTableActions = (props: MetadataTableActionsProps) => {

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
          <DropdownMenuItem className="text-xs" onSelect={props.onEditSchema}>
            <Pencil size={16} className="inline text-muted-foreground relative -top-px mr-2" />Edit schema
          </DropdownMenuItem>

          <DropdownMenuItem className="text-xs" onSelect={() => setConfirmDelete(true)}>
            <Trash2 size={16} className="inline text-red-400 relative -top-px mr-2" />
            <span className="text-red-500">Delete schema</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        message="This action will delete the schema permanently."
        onConfirm={props.onDeleteSchema}
        onOpenChange={setConfirmDelete} />
    </>
  )

}