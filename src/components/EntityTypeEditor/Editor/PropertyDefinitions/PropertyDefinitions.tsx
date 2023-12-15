import { CaseSensitive, Hash, Link2, List, MapPin } from 'lucide-react';
import { Button } from '@/ui/Button';
import { PropertyDefinition } from '@/model';
import { PropertyDefinitionActions } from './PropertyDefinitionActions';
import { PropertyEditorDialog } from './PropertyDefinitionEditorDialog';
import { moveArrayItem } from './moveArrayItem';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';


interface PropertyDefinitionsProps {

  properties: PropertyDefinition[];

  onChange(schema: PropertyDefinition[]): void;

}

export const PropertyDefinitions = (props: PropertyDefinitionsProps) => {

  const { properties } = props; 

  const addProperty = (added: PropertyDefinition) =>
    props.onChange([...properties, added]);

  const onMoveProperty = (property: PropertyDefinition, up: boolean) => () =>
    props.onChange(moveArrayItem(properties, properties.indexOf(property), up));

  const updateProperty = (updated: PropertyDefinition, previous: PropertyDefinition) =>
    props.onChange(properties.map(p => p === previous ? updated : p));

  const deleteProperty = (property: PropertyDefinition) => () =>
    props.onChange(properties.filter(p => p !== property));

  return (
    <Accordion
      type="single" 
      collapsible 
      className="w-full bg-muted rounded-md p-0">
      <AccordionItem value="schema" className="border-none">
        <AccordionTrigger 
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 p-3 m-0 hover:no-underline">
          <div className="flex flex-col items-start">
            <h3 className="text-sm">
              Schema
            </h3>

            <div className="text-xs mt-1 text-muted-foreground">
              {properties.length === 0 ? 
                'No schema defined' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'}`}
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <div className="p-3 pb-0 pt-5 border-t">
            {properties.length === 0 ? (
              <p 
                className="text-center flex text-muted-foreground 
                  px-7 pb-2 justify-center text-xs
                  leading-relaxed">
                Schemas allow you to record additional properties for 
                an entity, such as weight, material, age, etc.
              </p>
            ) : (
              <ul className="mb-1">
                {properties.map(p => (
                  <li 
                    key={p.name} 
                    className="flex text-xs w-full justify-between items-center
                      bg-muted-foreground/10 pl-3 pr-2 py-1.5 rounded-sm mb-1.5">
                    <div>
                      {p.type === 'text' ? (
                        <CaseSensitive 
                          className="inline w-5 h-5 mr-2" />
                      ) : p.type === 'number' ? (
                        <Hash 
                          className="inline w-4 h-4 mr-3" />
                      ) : p.type === 'enum' ? (
                        <List 
                          className="inline w-4 h-4 mr-3" />
                      ) : p.type === 'uri' ? (
                        <Link2 
                          className="inline w-4 h-4 mr-3" />
                      ) : p.type === 'geocoordinate' && (
                        <MapPin 
                          className="inline w-4 h-4 mr-3" />
                      )}
                      {p.name}
                    </div>

                    <PropertyDefinitionActions 
                      property={p} 
                      onMoveUp={onMoveProperty(p, true)}
                      onMoveDown={onMoveProperty(p, false)}
                      onUpdateProperty={updated => updateProperty(updated, p)}
                      onDeleteProperty={deleteProperty(p)} />
                  </li>
                ))}
              </ul>
            )}
            
            <div className="flex justify-end">
              <PropertyEditorDialog
                onSave={addProperty}>
                <Button 
                  variant="outline" 
                  className="text-xs mt-3 h-9 pl-2 px-3 font-medium hover:bg-muted-foreground/5" >
                  Add Property
                </Button>
              </PropertyEditorDialog>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

}