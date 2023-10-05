import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Entity, EntityProperty } from '@/model';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Textarea } from '@/ui/Textarea';
import { getRandomColor, getBrightness } from './entityColor';
import { EntitySchemaDetails } from './EntitySchemaDetails';

export interface EntityDetailsProps {

  entity?: Entity;

}

export const EntityDetails = (props: EntityDetailsProps) => {

  const [label, setLabel] = useState<string>('');

  const [color, setColor] = useState(props.entity?.color || getRandomColor());

  const brightness = getBrightness(color);

  const [properties, setProperties] = useState<EntityProperty[]>(props.entity?.schema || []);

  return (
    <article style={{ margin: 40, width: 380 }}>
      <div className="flex justify-center mb-8">
        <h2 
          className="rounded-full px-2.5 py-1 text-xs"
          style={{ 
            backgroundColor: color,
            color: brightness > 0.5 ? '#000' : '#fff' 
          }}>
          {label || 'Entity Preview'}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2 mb-3">
        <div>
          <Label 
            htmlFor="identifier"
            className="text-xs">ID</Label>

          <Input 
            id="identifier"
            className="h-9" />
        </div>

        <div>
          <Label 
            htmlFor="color"
            className="text-xs">Color</Label>

          <div className="grid grid-cols-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className={brightness < 0.9 ? 'h-9 w-9' : 'h-9 w-9 border shadow-sm'}
              style={{ 
                backgroundColor: color,
                color: brightness > 0.5 ? '#000' : '#fff' 
              }}
              onClick={() => setColor(getRandomColor())}>
              <RefreshCcw className="h-4 w-4" />
            </Button>

            <Input 
              id="color"
              className="col-span-3 h-9" 
              value={color} 
              onChange={evt => setColor(evt.target.value)}/>
          </div>
        </div>
      </div>

      <div className="grid gap-2 mb-4">
        <Label 
          htmlFor="label"
          className="text-xs">Label</Label>

        <Input
          id="label"
          onChange={evt => setLabel(evt.target.value)}
          className="h-9" />
            
        <Label 
          htmlFor="description"
          className="text-xs">Description</Label>

        <Textarea 
          id="description"
          rows={3} />
      </div>

      <EntitySchemaDetails 
        properties={properties}
        onChange={setProperties} />
      
      <div className="mt-4">
        <Button>Create</Button>
      </div>
    </article>
  )

}