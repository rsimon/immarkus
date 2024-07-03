import { useState } from 'react';
import { Replace, Settings, Trash2 } from 'lucide-react';
import { EntityTypeEditor } from '@/components/EntityTypeEditor';
import { TooltippedButton } from '@/components/TooltippedButton';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface PropertiesFormSectionActionsProps {

  entityType: EntityType;

  onDeleteBody(): void;

}

export const PropertiesFormSectionActions = (props: PropertiesFormSectionActionsProps) => {

  const model = useDataModel();

  const [edited, setEdited] = useState<EntityType | undefined>();

  const ancestors = model.getAncestors(props.entityType);

  // For the editor, we need to EXCLUDE inherited properties
  const withoutInherited = model.getEntityType(props.entityType.id);

  return (
    <div className="flex text-muted-foreground">
      {ancestors.length > 0 ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <TooltippedButton 
              variant="ghost" 
              type="button"
              size="icon" 
              className="rounded-full h-8 w-8"
              tooltip="Edit entity schema">
              <Settings className="h-4 w-4" />
            </TooltippedButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            {[...ancestors].map(type => (
              <DropdownMenuItem 
                key={type.id} 
                className="text-xs flex justify-between"
                onSelect={() => setEdited(type)}>
                <div>{type.label || type.id}</div>
                <Replace className="h-3.5 w-3.5 mr-0.5" />
              </DropdownMenuItem>
            ))}

            <DropdownMenuItem 
              className="text-xs"
              onSelect={() => setEdited(withoutInherited)}>
              {withoutInherited.label || withoutInherited.id}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <TooltippedButton 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-8 w-8"
          type="button"
          tooltip="Edit entity schema"
          onClick={() => setEdited(withoutInherited)}>
          <Settings className="h-4 w-4" />
        </TooltippedButton>
      )}

      <TooltippedButton 
        variant="ghost" 
        size="icon" 
        type="button"
        className="rounded-full h-8 w-8 -ml-1 hover:text-red-500"
        tooltip="Delete this tag"
        onClick={props.onDeleteBody}>
        <Trash2 className="h-4 w-4" />
      </TooltippedButton>

      <EntityTypeEditor 
        open={Boolean(edited)} 
        entityType={edited}
        onOpenChange={open => !open && setEdited(undefined)} />
    </div>
  )

}