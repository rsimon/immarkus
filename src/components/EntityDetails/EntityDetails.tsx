import { useEffect, useState } from 'react';
import { dequal } from 'dequal/lite';
import { AlertCircle, Braces, CheckCircle2, RefreshCcw } from 'lucide-react';
import { Entity, EntityProperty } from '@/model';
import { useVocabulary } from '@/store';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Textarea } from '@/ui/Textarea';
import { getRandomColor, getBrightness } from './entityColor';
import { EntityPreview } from './EntityPreview';
import { EntitySchemaDetails } from './EntitySchemaDetails';

export interface EntityDetailsProps {

  entity?: Entity;

  onSaved(): void;

}

export interface EntityStub {

  id?: string;

  label?: string;

  color?: string;

  description?: string;

  schema?: EntityProperty[];

}

const validate = (stub: EntityStub): Entity | undefined =>
  (stub.id && stub.label) ? stub as Entity : undefined;

export const EntityDetails = (props: EntityDetailsProps) => {

  const { vocabulary, addEntity, updateEntity } = useVocabulary();

  const { entities } = vocabulary;

  const [entity, setEntity] = useState<EntityStub>(props.entity || {
    color: getRandomColor()
  });

  const isIdAvailable = props.entity ?
    // Editing existing - check if entity with the ID is props.entity.id
    !entities.find(e => e.id === entity.id) || entities.find(e => e.id === entity.id).id === props.entity.id :

    // Not editing an existing entity - check if any exists with same ID
    !entities.find(e => e.id === entity.id);

  const [errors, setErrors] = useState<{ id: boolean, label: boolean } | undefined>();

  const brightness = getBrightness(entity.color);

  useEffect(() => {
    if (errors)
      setErrors({ id: !entity.id || !isIdAvailable, label: !entity.label });
  }, [entity]);

  const onSave = () => {
    const valid = isIdAvailable && validate(entity);
    if (valid) {
      // Save new or update existing?
      if (props.entity) {
        updateEntity(valid)
          .then(() => props.onSaved())
          .catch(error => {
            // TODO error handling
            console.error(error);
          });
      } else {
        addEntity(valid)
          .then(() => props.onSaved())
          .catch(error => {
            // TODO error handling!
            console.error(error);
          });
      }
    } else {
      setErrors({
        id: !entity.id || !isIdAvailable,
        label: !entity.label
      });
    }
  }

  return (
    <article className="grid grid-cols-2 rounded-lg overflow-hidden">
      <div className="py-3 px-4">
        <div className="grid grid-cols-2 gap-2 mt-2 mb-3">
          <div>
            <Label 
              htmlFor="identifier"
              className="text-xs">ID *
            </Label>{errors?.id && (<span className="text-xs text-red-600 ml-1">required</span>)}

            <Input 
              disabled={Boolean(props.entity)}
              id="identifier"
              className={errors?.id ? "mt-1 h-9 mb-1 border-red-500" : "mt-1 h-9"} 
              value={entity.id || ''} 
              onChange={evt => setEntity(e => ({...e, id: evt.target.value}))}/>

            {entity.id && (!isIdAvailable ? (
              <span className="flex items-center text-xs mt-3 text-red-600">
                <AlertCircle className="h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> ID already exists
              </span>
            ) : (props.entity && !(props.entity.id === entity.id)) || !props.entity && (
              <span className="flex items-center text-xs mt-3 text-green-600">
                <CheckCircle2 className="h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> {entity.id} is available
              </span>
            ))}
          </div>

          <div>
            <Label 
              htmlFor="color"
              className="text-xs">Color</Label>

            <div className="grid grid-cols-4">
              <Button 
                size="icon" 
                className={brightness < 0.9 ? 'h-9 w-9 mt-1' : 'h-9 w-9 border shadow-sm mt-1'}
                style={{ 
                  backgroundColor: entity.color,
                  color: brightness > 0.5 ? '#000' : '#fff' 
                }}
                onClick={() => setEntity(e => ({...e, color: getRandomColor() }))}>
                <RefreshCcw className="h-4 w-4" />
              </Button>

              <Input 
                id="color"
                className="col-span-3 h-9 mt-1" 
                value={entity.color} 
                onChange={evt => setEntity(e => ({...e, color: evt.target.value }))}/>
            </div>
          </div>
        </div>

        <div className="grid gap-2 mb-4">
          <div>
          <Label 
            htmlFor="label"
            className="text-xs">Label *
          </Label>{errors?.label && (<span className="text-xs text-red-600 ml-1">required</span>)}
          </div>

          <Input
            id="label"
            value={entity.label || ''}
            onChange={evt => setEntity(e => ({ ...e, label: evt.target.value }))}
            className={errors?.label ? "h-9 mt-1 mb-1 border-red-500" : "h-9 mt-1 mb-1"} />
              
          <Label 
            htmlFor="description"
            className="text-xs">Description</Label>

          <Textarea 
            id="description"
            className="mt-1"
            rows={3} 
            value={entity.description || ''} 
            onChange={evt => setEntity(e => ({ ...e, description: evt.target.value }))} />
        </div>

        <EntitySchemaDetails 
          properties={entity.schema || []}
          onChange={schema => setEntity(e => ({...e, schema }))} />

        <Button className="w-full mt-4" onClick={onSave}>
          <Braces className="w-5 h-5 mr-2" /> Save Entity
        </Button>
      </div>

      <EntityPreview 
        entity={entity} />
    </article>
  )

}