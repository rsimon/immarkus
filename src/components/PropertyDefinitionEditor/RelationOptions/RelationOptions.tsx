import { EntityTypeBrowser } from '@/components/EntityTypeBrowser';
import { EntityTypeSearchSimple } from '@/components/EntityTypeSearchSimple';
import { EntityType, RelationPropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Label } from '@/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

interface RelationOptionsProps {

  definition: Partial<RelationPropertyDefinition>;

  onUpdate(definition: Partial<RelationPropertyDefinition>): void;

}

export const RelationOptions = (props: RelationOptionsProps) => {

  const datamodel = useDataModel();

  const target = props.definition.targetType ?
    datamodel.getEntityType(props.definition.targetType, true) : undefined;

  const onChangeTargetType = (type: string) =>
    props.onUpdate({...props.definition, targetType: type });

  const onChangeLabelProperty = (name: string) =>
    props.onUpdate({ ...props.definition, labelProperty: name });

  return (
    <div className="bg-muted px-3 pt-3 pb-4 mt-4 mb-6 rounded-md text-sm">
      <p className="text-xs leading-relaxed px-0.5 mt-0.5 mb-7">
        Relations connect one annotated entity to another. First, select
        the <strong>target entity class</strong> you wish to link to.
        Then, choose an <strong>identifying property</strong> from the 
        target class (e.g. a name). IMMARKUS will provide autocomplete 
        suggestions for the target entity based on your selection.
      </p>

      <div>
        <Label 
          htmlFor="name"
          className="inline-block text-xs mb-1.5 ml-0.5">
          Target Entity Class
        </Label>

        <EntityTypeSearchSimple 
          className="bg-white"
          value={props.definition.targetType} 
          onChange={onChangeTargetType} />
      </div>

      <div className="mt-4">
        <Label 
          htmlFor="name"
          className="inline-block text-xs mb-1.5 ml-0.5">
          Identifying Property
        </Label>

        <Select 
          value={props.definition.labelProperty} 
          onValueChange={onChangeLabelProperty}>
            
          <SelectTrigger className="w-full bg-white">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {target && (target.properties || []).map(property => (
              <SelectItem 
                key={property.name}
                value={property.name}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

}