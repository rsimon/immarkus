import { useMemo } from 'react';
import { Button } from '@/ui/Button';
import { EntityType, PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { PropertyTypeIcon } from '@/components/PropertyTypeIcon';
import { 
  moveArrayItem, 
  PropertyDefinitionEditorDialog, 
  PropertyDefinitionActions 
} from '@/components/PropertyDefinitionEditor';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';

interface PropertyDefinitionsProps {

  entityType: Partial<EntityType>;

  properties: PropertyDefinition[];

  onChange(properties: PropertyDefinition[]): void;

}

export const PropertyDefinitions = (props: PropertyDefinitionsProps) => {

  const { entityType, properties } = props; 

  const datamodel = useDataModel();

  const schema: PropertyDefinition[] = useMemo(() => {
    const properties = entityType.properties || [];
    if (!entityType.parentId) return properties;

    return [...properties, ...(datamodel.getEntityType(entityType.parentId, true)?.properties || [])];
  }, [entityType]);

  const addProperty = (added: PropertyDefinition) =>
    props.onChange([...properties, added]);

  const moveProperty = (property: PropertyDefinition, up: boolean) => () =>
    props.onChange(moveArrayItem(properties, properties.indexOf(property), up));

  const updateProperty = (updated: PropertyDefinition, previous: PropertyDefinition) =>
    props.onChange(properties.map(p => p === previous ? updated : p));

  const deleteProperty = (property: PropertyDefinition) => () =>
    props.onChange(properties.filter(p => p !== property));

  const editorHint = 
    'Use Properties to record specific details in your annotations, such as weight, material, age, etc.';

  const previewHint =
    'This is how your property will appear when editing an entity in the annotation interface.';

  return (
    <Accordion
      type="single" 
      collapsible 
      className="w-full bg-muted rounded-md p-0">
      <AccordionItem value="properties" className="border-none">
        <AccordionTrigger 
          className="rounded-md p-3 m-0 hover:no-underline">
          <div className="flex flex-col items-start">
            <h3 className="text-xs">
              {properties.length === 0 
                ? 'No Properties' 
                : `${properties.length} Propert${properties.length === 1 ? 'y' : 'ies'}`}
            </h3>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div className="p-3 pb-0 pt-3 border-t">
            {properties.length === 0 ? (
              <p 
                className="text-center flex text-muted-foreground 
                  px-3 pb-2 justify-center text-xs
                  leading-relaxed">
                Use Properties to record specific details for an annotated Entity,
                such as weight, material, age, etc. 
              </p>
            ) : (
              <ul>
                {properties.map(p => (
                  <li 
                    key={p.name} 
                    className="flex text-xs w-full justify-between items-center
                      bg-muted-foreground/10 pl-3 pr-2 py-1.5 rounded-sm mb-1.5">
                    
                    <div className="flex align-middle">
                      <PropertyTypeIcon 
                        definition={p} 
                        className="mr-2 inline" /> 
                      
                      <div className="relative top-[1px] inline-flex gap-1">
                        {p.name}
                      </div>
                    </div>

                    <PropertyDefinitionActions 
                      editorHint={editorHint}
                      previewHint={previewHint}
                      definition={p} 
                      schema={schema}
                      onMoveUp={moveProperty(p, true)}
                      onMoveDown={moveProperty(p, false)}
                      onUpdateProperty={updated => updateProperty(updated, p)}
                      onDeleteProperty={deleteProperty(p)} />
                  </li>
                ))}
              </ul>
            )}
            
            <div className="flex justify-end">
              <PropertyDefinitionEditorDialog
                editorHint={editorHint}
                previewHint={previewHint}
                schema={schema}
                onSave={addProperty}>
                <Button 
                  variant="outline" 
                  className="text-xs mt-3 h-9 pl-2 px-3 font-medium hover:bg-muted-foreground/5">
                  Add Property
                </Button>
              </PropertyDefinitionEditorDialog>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

}