import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface EntityTypeActionsProps {

  entityType: EntityType;

  onEditEntityType(): void;

  onDeleteEntityType(): void;

}

export const EntityTypeActions = (props: EntityTypeActionsProps) => {

  const datamodel = useDataModel();

  const [confirmDelete, setConfirmDelete] = useState(false);

  const children = datamodel.getChildTypes(props.entityType.id);

  const message = children.length > 0
    ? `This action will delete the entity class from the vocabulary. ${children.length} child class${children.length > 1 ? 'es' : ''} will be moved to the root of your data model.` 
    : "This action will delete the entity class from the vocabulary."

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
            <Pencil size={16} className="inline text-muted-foreground relative -top-px mr-2" />Edit Entity Class
          </DropdownMenuItem>

          <DropdownMenuItem className="text-xs" onSelect={() => setConfirmDelete(true)}>
            <Trash2 size={16} className="inline text-red-400 relative -top-px mr-2" />
            <span className="text-red-500">Delete Entity Class</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        message={message}
        onConfirm={props.onDeleteEntityType}
        onOpenChange={setConfirmDelete} />
    </>
  )

}