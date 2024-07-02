import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { EntityTypeSearchSimple } from '@/components/EntityTypeSearchSimple';
import { RelationPropertyDefinition } from '@/model';
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

  const [value, setValue] = useState(props.definition.targetType);
  
  const target = value ? datamodel.getEntityType(value, true) : undefined;

  const onChangeTargetType = (type: string) => {
    setValue(type);

    const isValid = Boolean(datamodel.getEntityType(type));
    if (isValid)
      props.onUpdate({...props.definition, targetType: type, labelProperty: undefined });
  }

  const onChangeLabelProperty = (name: string) =>
    props.onUpdate({ ...props.definition, labelProperty: name });

  useEffect(() => {
    setValue(props.definition.targetType);
  }, [props.definition])

  const invalidTargetClass = value && !target;

  return (
    <div className="bg-muted px-3 pt-3 pb-4 mt-4 rounded-md text-sm">
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
          value={value} 
          onChange={onChangeTargetType} />

        {invalidTargetClass && (
          <span className="flex items-center text-xs px-0.5 mt-2 text-red-600 whitespace-nowrap">
            <AlertCircle className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> 
            <>Must be a valid entity class ID</>
          </span>
        )}
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

          <SelectContent className="max-h-96">
            {(target?.properties || []).length === 0 ? (
              <span className="text-muted-foreground text-sm p-2 flex justify-center">
                No properties
              </span>
            ) : target.properties.map(property => (
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