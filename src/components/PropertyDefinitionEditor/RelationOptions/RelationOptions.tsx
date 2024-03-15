import { useState } from 'react';
import { DataModelSearch } from '@/components/DataModelSearch';
import { EntityType, RelationPropertyDefinition } from '@/model';
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

  const [target, setTarget] = useState<EntityType>();

  const onSelect = (type: EntityType) => setTarget(type);

  const onConfirm = (type: EntityType) => {

  }

  return (
    <div className="bg-muted px-2 py-3 mt-2 rounded-md text-sm">
      <p>
        
      </p>

      <div className="mt-4">
        <Label 
          htmlFor="name"
          className="inline-block text-xs mb-1.5 ml-0.5">
          Target Entity Class
        </Label>

        <DataModelSearch 
          onSelect={onSelect}
          onConfirm={onConfirm} />
      </div>

      <div className="mt-4">
        <Label 
          htmlFor="name"
          className="inline-block text-xs mb-1.5 ml-0.5">
          Display Label
        </Label>

        <Select>
          <SelectTrigger className="w-full bg-white">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {(target?.properties || []).map(property => (
              <SelectItem value={property.name}>
                {property.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

}