import { useState } from 'react';
import { Braces, RefreshCcw } from 'lucide-react';
import { Entity, EntityProperty } from '@/model';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Textarea } from '@/ui/Textarea';
import { getRandomColor, getBrightness } from './entityColor';
import { EntityPreview } from './EntityPreview';
import { EntitySchemaDetails } from './EntitySchemaDetails';

export interface EntityDetailsProps {

  entity?: Entity;

}

export interface EntityStub {

  id?: string;

  label?: string;

  color?: string;

  description?: string;

  schema?: EntityProperty[];

}

export const EntityDetails = (props: EntityDetailsProps) => {

  const [entity, setEntity] = useState<EntityStub>(props.entity || {
    color: getRandomColor()
  });

  const brightness = getBrightness(entity.color);

  return (
    <article className="grid grid-cols-2 rounded-lg overflow-hidden">
      <div className="py-3 px-4">
        <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
          <div>
            <Label 
              htmlFor="identifier"
              className="text-xs">ID</Label>

            <Input 
              id="identifier"
              className="h-9" 
              value={entity.id || ''} 
              onChange={evt => setEntity(e => ({...e, id: evt.target.value}))}/>
          </div>

          <div>
            <Label 
              htmlFor="color"
              className="text-xs">Color</Label>

            <div className="grid grid-cols-4 gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className={brightness < 0.9 ? 'h-9 w-9' : 'h-9 w-9 border shadow-sm'}
                style={{ 
                  backgroundColor: entity.color,
                  color: brightness > 0.5 ? '#000' : '#fff' 
                }}
                onClick={() => setEntity(e => ({...e, color: getRandomColor() }))}>
                <RefreshCcw className="h-4 w-4" />
              </Button>

              <Input 
                id="color"
                className="col-span-3 h-9" 
                value={entity.color} 
                onChange={evt => setEntity(e => ({...e, color: evt.target.value }))}/>
            </div>
          </div>
        </div>

        <div className="grid gap-2 mb-4">
          <Label 
            htmlFor="label"
            className="text-xs">Label</Label>

          <Input
            id="label"
            value={entity.label || ''}
            onChange={evt => setEntity(e => ({ ...e, label: evt.target.value }))}
            className="h-9" />
              
          <Label 
            htmlFor="description"
            className="text-xs">Description</Label>

          <Textarea 
            id="description"
            rows={3} 
            value={entity.description || ''} 
            onChange={evt => setEntity(e => ({ ...e, description: evt.target.value }))} />
        </div>

        <EntitySchemaDetails 
          properties={entity.schema || []}
          onChange={schema => setEntity(e => ({...e, schema }))} />

        <Button className="w-full mt-4">
          <Braces className="w-5 h-5 mr-2" /> Save Entity
        </Button>
      </div>

      <EntityPreview 
        entity={entity} />
    </article>
  )

}