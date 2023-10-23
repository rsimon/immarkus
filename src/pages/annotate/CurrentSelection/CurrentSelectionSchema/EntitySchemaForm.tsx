import { ImageAnnotation } from '@annotorious/react';
import { Entity } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/ui/Select';

interface EntitySchemaFormProps {

  entity: Entity;

  annotation: ImageAnnotation;

}

export const EntitySchemaForm = (props: EntitySchemaFormProps) => {

  const { annotation, entity } = props;

  return (
    <div className="mt-2 px-1">
      {(entity.schema || []).map(property => (
        <div className="mt-1" key={property.name}>
          <Label 
            htmlFor={property.name}
            className="text-xs">
            {property.name}
          </Label>

          {property.type === 'enum' ? (
            <Select>
              <SelectTrigger className="w-full h-8 mt-0.5">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {property.values.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input 
              id={property.name} 
              className="h-8 mt-0.5" />
          )}
        </div>
      ))}
    </div>
  )

}