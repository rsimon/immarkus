import { Settings, Trash2 } from 'lucide-react';
import { EntityTypeEditor } from '@/components/EntityTypeEditor';
import { TooltippedButton } from '@/components/TooltippedButton';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';

interface PropertiesFormSectionActionsProps {

  entityType: EntityType;

  onDeleteBody(): void;

}

export const PropertiesFormSectionActions = (props: PropertiesFormSectionActionsProps) => {

  const model = useDataModel();

  // const ancestors = model.getAncestors(props.entityType);
  // console.log('ancestors', ancestors);

  // For the editor, we need to EXCLUDE inherited properties
  const withoutInherited = model.getEntityType(props.entityType.id);

  return (
    <div className="flex text-muted-foreground">
      <EntityTypeEditor entityType={withoutInherited}>
        <TooltippedButton 
          variant="ghost" 
          size="icon" 
          className="rounded-full h-8 w-8"
          tooltip="Edit entity schema">
          <Settings className="h-4 w-4" />
        </TooltippedButton>
      </EntityTypeEditor>

      <TooltippedButton 
        variant="ghost" 
        size="icon" 
        type="button"
        className="rounded-full h-8 w-8 -ml-1 hover:text-red-500"
        tooltip="Delete this tag"
        onClick={props.onDeleteBody}>
        <Trash2 className="h-4 w-4" />
      </TooltippedButton>
    </div>

  )

}