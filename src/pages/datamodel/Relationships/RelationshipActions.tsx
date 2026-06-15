import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ConfirmedDelete } from '@/components/ConfirmedDelete';
import { Button } from '@/ui/Button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface RelationshipActionsProps {

  onEdit(): void;

  onDelete(): void;

}

export const RelationshipActions = (props: RelationshipActionsProps) => {

  const { t } = useTranslation('datamodel');

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
            <Pencil size={16} className="inline text-muted-foreground relative -top-px mr-2" />{t('relationshipActions.edit')}
          </DropdownMenuItem>

          <DropdownMenuItem className="text-xs" onSelect={() => setConfirmDelete(true)}>
            <Trash2 size={16} className="inline text-red-400 relative -top-px mr-2" />
            <span className="text-red-500">{t('relationshipActions.delete')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmedDelete
        open={confirmDelete}
        message={t('relationshipActions.confirmDelete')}
        onConfirm={props.onDelete}
        onOpenChange={setConfirmDelete} />
    </>
  )

}