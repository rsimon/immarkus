import { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/ui/Button';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/DropdownMenu';

interface AnnotationListItemActionsProps {

  onSelectAnnotation(): void;

  onDeleteAnnotation(): void;

}

export const AnnotationListItemActions = (props: AnnotationListItemActionsProps) => {

  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost" 
            size="icon"
            className="absolute top-2 right-1 rounded-full h-7 w-7 text-muted-foreground/80 hover:text-black/80">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={props.onSelectAnnotation}>
            <Pencil size={16} className="inline text-muted-foreground relative -top-px mr-2" />Edit
          </DropdownMenuItem>

          <DropdownMenuItem onSelect={() => setConfirmDelete(true)}>
            <Trash2 size={16} className="inline text-red-400 relative -top-px mr-2" />
            <span className="text-red-500">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
          open={confirmDelete}
          label="This action will delete the annotation permanently."
          onConfirm={props.onDeleteAnnotation}
          onOpenChange={setConfirmDelete} />
    </>
  )

}
