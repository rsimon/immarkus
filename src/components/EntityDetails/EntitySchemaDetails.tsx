import { Plus, Settings, X } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';
import { Button } from '@/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/Table';
import { PropertyDialog } from './PropertyDialog';
import { EntityProperty } from '@/model';

interface EntitySchemaDetailsProps {

  properties: EntityProperty[];

  onChange(schema: EntityProperty[]): void;

}

export const EntitySchemaDetails = (props: EntitySchemaDetailsProps) => {

  const { properties } = props; 

  const addProperty = (added: EntityProperty) =>
    props.onChange([...properties, added]);

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
              Entity Schema
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
                  px-7 pt-5 pb-6 justify-center text-xs
                  leading-relaxed">
                Schemas allow you to record additional properties for 
                an entity, such as weight, material, age, etc.
              </p>
            ) : (
              <Table className="mt-4">
                <TableHeader>
                  <TableRow className="text-xs p-0 hover:bg-muted/0">
                    <TableHead className="p-1 h-8 pl-0 hover:bg-opacity-0">Name</TableHead>
                    <TableHead className="p-1 h-8">Type</TableHead>
                    <TableHead className="p-1 h-8"></TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {properties.map(p => (
                    <TableRow key={p.name} className="text-xs">
                      <TableCell className="p-1 w-2/3 pl-0">{p.name}</TableCell>

                      <TableCell className="p-1">{p.type.toUpperCase()}</TableCell>

                      <TableCell className="p-1 pl-6 flex justify-end">
                        <PropertyDialog
                          property={p}
                          onUpdate={updated => updateProperty(updated, p)}>

                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-muted-foreground hover:text-black">
                            <Settings className="w-3.5 h-3.5 " />
                          </Button>

                        </PropertyDialog>

                        <Button 
                          onClick={deleteProperty(p)}
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-muted-foreground hover:text-black">
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
            )}

            <PropertyDialog
              onUpdate={addProperty}>

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  className="text-xs mt-4 h-8 pl-2 pr-3 font-medium hover:bg-muted-foreground/5" >
                  <Plus className="w-4 h-5 mr-1" /> Add Property
                </Button>
              </div>

            </PropertyDialog>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )

}