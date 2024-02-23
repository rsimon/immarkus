import { Settings, Trash2 } from 'lucide-react';
import { EntityTypeEditor } from '@/components/EntityTypeEditor';
import { TooltippedButton } from '@/components/TooltippedButton';
import { EntityType } from '@/model';

interface PropertiesFormSectionActionsProps {

  entityType: EntityType;

}

export const PropertiesFormSectionActions = (props: PropertiesFormSectionActionsProps) => {

  return (
    <div className="flex text-muted-foreground">
      <EntityTypeEditor entityType={props.entityType}>
        <TooltippedButton 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-8 w-8"
          tooltip="Edit schema">
          <Settings className="h-4 w-4" />
        </TooltippedButton>
      </EntityTypeEditor>

      <TooltippedButton 
        variant="ghost" 
        size="icon" 
        type="button"
        className="rounded-full h-8 w-8 -ml-1 hover:text-red-500"
        tooltip="Delete tag">
        <Trash2 className="h-4 w-4" />
      </TooltippedButton>
    </div>

  )

}