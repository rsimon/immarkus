import { CaseSensitive, Hash, List } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';
import { Button } from '@/ui/Button';
import { EntityProperty } from '@/model';
import { EntitySchemaPropActions } from './EntitySchemaPropActions';
import { PropertyDialog } from './PropertyDialog';
import { moveArrayItem } from './moveArrayItem';

interface EntitySchemaDetailsProps {

  properties: EntityProperty[];

  onChange(schema: EntityProperty[]): void;

}

export const EntitySchemaDetails = (props: EntitySchemaDetailsProps) => {

  const { properties } = props; 

  const addProperty = (added: EntityProperty) =>
    props.onChange([...properties, added]);

  const onMoveProperty = (property: EntityProperty, up: boolean) => () =>
    props.onChange(moveArrayItem(properties, properties.indexOf(property), up));

  const updateProperty = (updated: EntityProperty, previous: EntityProperty) =>
    props.onChange(properties.map(p => p === previous ? updated : p));

  const deleteProperty = (property: EntityProperty) => () =>
    props.onChange(properties.filter(p => p !== property));

  return (
    <Accordion
      type="single" 
      collapsible 
      className="w-full bg-muted rounded-md p-0">
      <AccordionItem value="schema" className="border-none">
        <AccordionTrigger className="p-3 m-0 hover:no-underline">
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
          <div className="p-3 pb-0">
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
                      {p.type === 'string' ? (
                        <CaseSensitive 
                          className="inline w-5 h-5 mr-2" />
                      ) : p.type === 'number' ? (
                        <Hash 
                          className="inline w-4 h-4 mr-3" />
                      ) : p.type === 'enum' && (
                        <List 
                          className="inline w-4 h-4 mr-3" />
                      )}
                      {p.name}
                    </div>

                    <EntitySchemaPropActions 
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
              <PropertyDialog
                onUpdate={addProperty}>
                <Button 
                  variant="outline" 
                  className="text-xs mt-3 h-9 pl-2 px-3 font-medium hover:bg-muted-foreground/5" >
                  Add Property
                </Button>
              </PropertyDialog>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

}