import { useEffect, useState } from 'react';
import { AlertCircle, Braces, CheckCircle2, RefreshCcw } from 'lucide-react';
import { EntityType, PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Textarea } from '@/ui/Textarea';
import { getRandomColor, getBrightness } from './entityColor';
import { EntityPreview } from './EntityPreview';
import { EntitySchemaDetails } from './EntitySchemaDetails';

export interface EntityDetailsProps {

  entityType?: EntityType;

  onSaved(): void;

}

export interface EntityTypeStub {

  id?: string;

  label?: string;

  color?: string;

  description?: string;

  schema?: PropertyDefinition[];

}

const validate = (stub: EntityTypeStub): EntityType | undefined =>
  (stub.id && stub.label) ? stub as EntityType : undefined;

export const EntityDetails = (props: EntityDetailsProps) => {

  const { model, addEntityType, updateEntityType } = useDataModel();

  const { entityTypes } = model;

  const [entityType, setEntityType] = useState<EntityTypeStub>(props.entityType || {
    color: getRandomColor()
  });

  const isIdAvailable = props.entityType
    // Editing existing - check if entity with the ID is props.entity.id
    ? !entityTypes.find(e => e.id === entityType.id) 
      || entityTypes.find(e => e.id === entityType.id).id === props.entityType.id

    // Not editing an existing entity - check if any exists with same ID
    : !entityTypes.find(e => e.id === entityType.id);

  const [errors, setErrors] = useState<{ id: boolean, label: boolean } | undefined>();

  const brightness = getBrightness(entityType.color);

  useEffect(() => {
    if (errors)
      setErrors({ id: !entityType.id || !isIdAvailable, label: !entityType.label });
  }, [entityType]);

  const onSave = () => {
    const valid = isIdAvailable && validate(entityType);
    if (valid) {
      // Save new or update existing?
      if (props.entityType) {
        updateEntityType(valid)
          .then(() => props.onSaved())
          .catch(error => {
            // TODO error handling
            console.error(error);
          });
      } else {
        addEntityType(valid)
          .then(() => props.onSaved())
          .catch(error => {
            // TODO error handling!
            console.error(error);
          });
      }
    } else {
      setErrors({
        id: !entityType.id || !isIdAvailable,
        label: !entityType.label
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
              disabled={Boolean(props.entityType)}
              id="identifier"
              className={errors?.id ? "mt-1 h-9 mb-1 border-red-500" : "mt-1 h-9"} 
              value={entityType.id || ''} 
              onChange={evt => setEntityType(e => ({...e, id: evt.target.value}))}/>

            {entityType.id && (!isIdAvailable ? (
              <span className="flex items-center text-xs mt-3 text-red-600 whitespace-nowrap">
                <AlertCircle className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> ID already exists
              </span>
            ) : (props.entityType && !(props.entityType.id === entityType.id)) || !props.entityType && (
              <span className="flex items-center text-xs mt-3 text-green-600 whitespace-nowrap">
                <CheckCircle2 className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> {entityType.id} is available
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
                  backgroundColor: entityType.color,
                  color: brightness > 0.5 ? '#000' : '#fff' 
                }}
                onClick={() => setEntityType(e => ({...e, color: getRandomColor() }))}>
                <RefreshCcw className="h-4 w-4" />
              </Button>

              <Input 
                id="color"
                className="col-span-3 h-9 mt-1" 
                value={entityType.color} 
                onChange={evt => setEntityType(e => ({...e, color: evt.target.value }))}/>
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
            value={entityType.label || ''}
            onChange={evt => setEntityType(e => ({ ...e, label: evt.target.value }))}
            className={errors?.label ? "h-9 mt-1 mb-1 border-red-500" : "h-9 mt-1 mb-1"} />
              
          <Label 
            htmlFor="description"
            className="text-xs">Description</Label>

          <Textarea 
            id="description"
            className="mt-1"
            rows={3} 
            value={entityType.description || ''} 
            onChange={evt => setEntityType(e => ({ ...e, description: evt.target.value }))} />
        </div>

        <EntitySchemaDetails 
          properties={entityType.schema || []}
          onChange={schema => setEntityType(e => ({...e, schema }))} />

        <Button className="w-full mt-4" onClick={onSave}>
          <Braces className="w-5 h-5 mr-2" /> Save Entity
        </Button>
      </div>

      <EntityPreview 
        entityType={entityType} />
    </article>
  )

}