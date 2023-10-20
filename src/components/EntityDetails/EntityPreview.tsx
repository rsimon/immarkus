import { Braces } from 'lucide-react';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { getBrightness } from './entityColor';
import { EntityStub } from './EntityDetails';

interface EntityPreviewProps {

  entity: EntityStub;

}

export const EntityPreview = (props: EntityPreviewProps) => {

  const { entity } = props;

  const brightness = getBrightness(entity.color);

  return (
    <div className="bg-muted px-8 py-6 border-l">
      <h2 className="mb-6">
        Preview
      </h2>

      <div className="flex">
        <h3 
          className="rounded-full pl-2.5 pr-3.5 py-1 flex items-center text-xs"
          style={{ 
            backgroundColor: entity.color,
            color: brightness > 0.5 ? '#000' : '#fff' 
          }}>
          <Braces className="inline h-3.5 w-3.5 mr-1.5" />
          {entity.label || 'Entity Preview'}
        </h3>
      </div>

      {entity.description && (
        <p className="text-xs text-muted-foreground p-1 mt-1">
          {entity.description}
        </p>
      )}

      <div className="mt-2">
        {(entity.schema || []).map(property => (
          <div className="mt-1">
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
                    <SelectItem value={option}>{option}</SelectItem>
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
    </div>
  )

}