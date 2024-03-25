import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Cuboid, RefreshCcw } from 'lucide-react';
import { EntityTypeSearchSimple } from '@/components/EntityTypeSearchSimple';
import { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Textarea } from '@/ui/Textarea';
import { getRandomColor, getBrightness } from '@/utils/color';
import { EntityPreview } from './EntityPreview/EntityPreview';
import { PropertyDefinitions } from './PropertyDefinitions/PropertyDefinitions';

export interface EditorProps {

  entityType?: EntityType;

  onSaved(): void;

  onSaveError(error: Error): void;

}

interface ValidationErrors {

  invalidId?: boolean;

  invalidParent?: boolean;

}

export const Editor = (props: EditorProps) => {

  const model = useDataModel();

  const { entityTypes } = model;

  const [entityType, setEntityType] = useState<Partial<EntityType>>(props.entityType || {
    color: getRandomColor()
  });

  const isIdAvailable = props.entityType
    // Editing existing - check if entity with the ID is props.entity.id
    ? !entityTypes.find(e => e.id === entityType.id) 
      || entityTypes.find(e => e.id === entityType.id).id === props.entityType.id

    // Not editing an existing entity - check if any exists with same ID
    : !entityTypes.find(e => e.id === entityType.id);

  const isValidParent = entityType.parentId 
    ? Boolean(model.getEntityType(entityType.parentId)) && !(entityType.parentId === entityType.id)
    : true;
  
  const [errors, setErrors] = useState<ValidationErrors | undefined>();

  const brightness = getBrightness(entityType.color);

  useEffect(() => {
    if (errors) {
      setErrors({ 
        invalidId: !entityType.id || !isIdAvailable,
        invalidParent: entityType.parentId && !model.getEntityType(entityType.parentId)
      });
    }
  }, [entityType]);

  const validate = (): EntityType | undefined => {
    const allPropertiesValid = (entityType.properties || []).every(d => 
      d.type === 'enum' ||
      d.type === 'external_authority' ||
      d.type === 'geocoordinate' ||
      d.type === 'measurement' ||
      d.type === 'number' ||
      d.type === 'relation' ||
      d.type === 'text' ||
      d.type === 'uri');

    return allPropertiesValid && entityType.id && isIdAvailable && isValidParent
      ? entityType as EntityType
      : undefined;
  }

  const onSave = () => {
    const valid = validate();

    if (valid) {
      if (props.entityType) { // Update existing
        model.updateEntityType(valid)
          .then(() => props.onSaved())
          .catch(props.onSaveError);
      } else { // Save new
        model.addEntityType(valid)
          .then(() => props.onSaved())
          .catch(props.onSaveError);
      }
    } else {
      setErrors({ 
        invalidId: !entityType.id || !isIdAvailable,
        invalidParent: !isValidParent
      });
    }
  }

  return (
    <article
      className="grid grid-cols-2 rounded-lg">
      <div className="px-8 py-3">
        <div className="grid grid-cols-2 gap-3 mt-2 mb-1">
          <div>
            <Label 
              htmlFor="identifier"
              className="inline-block text-xs mb-1.5 ml-0.5">Entity Class *
            </Label>
            
            {errors?.invalidId && (<span className="text-xs text-red-600 ml-1">required</span>)}

            <Input 
              disabled={Boolean(props.entityType)}
              id="identifier"
              className={errors?.invalidId ? 'bg-white border-red-500' : 'bg-white'} 
              value={entityType.id || ''} 
              onChange={evt => setEntityType(e => ({...e, id: evt.target.value}))}/>

            {entityType.id && (!isIdAvailable ? (
              <span className="flex items-center text-xs mt-3 text-red-600 whitespace-nowrap">
                <AlertCircle className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> ID already exists
              </span>
            ) : (props.entityType && !(props.entityType.id === entityType.id)) || !props.entityType && (
              <span className="flex items-center text-xs mt-2 text-green-600 whitespace-nowrap">
                <CheckCircle2 className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> {entityType.id} is available
              </span>
            ))}
          </div>

          <div>
            <Label 
              htmlFor="color"
              className="inline-block text-xs mb-1.5 ml-0.5">Color</Label>

            <div className="grid grid-cols-4">
              <Button 
                size="icon" 
                className={brightness < 0.9 ? 'h-9 w-9' : 'h-9 w-9 border shadow-sm'}
                style={{ 
                  backgroundColor: entityType.color,
                  color: brightness > 0.5 ? '#000' : '#fff' 
                }}
                onClick={() => setEntityType(e => ({...e, color: getRandomColor() }))}>
                <RefreshCcw className="h-4 w-4" />
              </Button>

              <Input 
                id="color"
                className="col-span-3 bg-white" 
                value={entityType.color} 
                onChange={evt => setEntityType(e => ({...e, color: evt.target.value }))}/>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <Label 
            htmlFor="label"
            className="inline-block text-xs mb-1.5 ml-0.5">Display Name
          </Label>

          <Input
            id="label"
            className="bg-white"
            value={entityType.label || ''}
            onChange={evt => setEntityType(e => ({ ...e, label: evt.target.value }))} />
        </div>

        <div className="mt-6">
          <Label 
            htmlFor="parent"
            className="inline-block text-xs mb-1.5 ml-0.5">Parent Class
          </Label>

          <EntityTypeSearchSimple
            id="parent"
            className={errors?.invalidParent ? 'border-red-500 bg-white' : 'bg-white'} 
            value={entityType.parentId}
            onChange={parentId => setEntityType(e => ({ ...e, parentId }))} />

          {!isValidParent ? (
            <span className="flex items-center text-xs mt-2 text-red-600 whitespace-nowrap">
              <AlertCircle className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> 
                {entityType.parentId === entityType.id ? (
                  <>{entityType.id} cannot be its own parent</>
                ) : (
                  <>No Entity Class called {entityType.parentId}</>
                )}
            </span>
          ) : entityType.parentId && entityType.parentId !== props.entityType?.parentId && isValidParent && (
            <span className="flex items-center text-xs mt-2 text-green-600 whitespace-nowrap">
              <CheckCircle2 className="flex-shrink-0 h-3.5 w-3.5 mb-0.5 ml-0.5 mr-1" /> {entityType.parentId} is a valid parent
            </span>
          )}
        </div>

        <div className="mt-6">
          <Label 
            htmlFor="description"
            className="inline-block text-xs mb-1.5 ml-0.5">Entity Class Description</Label>

          <Textarea 
            id="description"
            className="bg-white"
            rows={3} 
            value={entityType.description || ''} 
            onChange={evt => setEntityType(e => ({ ...e, description: evt.target.value }))} />
        </div>

        <div className="mt-5">
          <PropertyDefinitions 
            properties={entityType.properties || []}
            onChange={properties => setEntityType(e => ({...e, properties }))} />
        </div>

        <Button className="w-full mt-7 mb-3" onClick={onSave}>
          <Cuboid className="w-5 h-5 mr-2" /> Save Entity Class
        </Button>
      </div>

      <EntityPreview 
        entityType={entityType} />
    </article>
  )

}