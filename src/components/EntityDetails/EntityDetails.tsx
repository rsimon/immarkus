import { useState } from 'react';
import { Plus, RefreshCcw, X } from 'lucide-react';
import { Entity, EntityProperty } from '@/model';
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
import { PropertyDetails } from './PropertyDetails';

interface EntityDetailsProps {

  entity?: Entity;

}

const dummyProperties: EntityProperty[] = [{
  type: 'string', name: 'Name'
}, {
  type: 'number', name: 'No. of arches'
}, {
  type: 'enum', name: 'Material', values: ['Wood', 'Brick']
}];

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

const getBrightness = (color: string) => {
  const hexColor = color.replace(/^#/, '');

  const r = parseInt(hexColor.slice(0, 2), 16) / 255;
  const g = parseInt(hexColor.slice(2, 4), 16) / 255;
  const b = parseInt(hexColor.slice(4, 6), 16) / 255;

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const EntityDetails = (props: EntityDetailsProps) => {

  const [label, setLabel] = useState<string>('');

  const [color, setColor] = useState(props.entity?.color || getRandomColor());

  const brightness = getBrightness(color);

  const [properties, setProperties] = useState<EntityProperty[]>(dummyProperties);

  const deleteProperty = (property: EntityProperty) => () =>
    setProperties(props => props.filter(p => p !== property));

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
          <label 
            htmlFor="identifier"
            className="text-xs font-medium 
              leading-none peer-disabled:cursor-not-allowed 
              peer-disabled:opacity-70">
            ID
          </label>

          <input 
            id="identifier"
            className="flex h-9 w-full rounded-md border border-input 
              bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
              file:border-0 file:bg-transparent file:text-sm file:font-medium 
              placeholder:text-muted-foreground focus-visible:outline-none 
              focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring 
              disabled:cursor-not-allowed disabled:opacity-50" />
        </div>

        <div>
          <label 
            htmlFor="color"
            className="text-xs font-medium leading-none 
              peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Color
          </label>

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

            <input 
              id="color"
              className="col-span-3 flex h-9 rounded-md border border-input 
                bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
                file:border-0 file:bg-transparent file:text-sm file:font-medium 
                placeholder:text-muted-foreground focus-visible:outline-none 
                focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring 
                disabled:cursor-not-allowed disabled:opacity-50" 
              value={color} 
              onChange={evt => setColor(evt.target.value)}/>
          </div>
        </div>
      </div>

      <div className="grid gap-2 mb-2">
        <label 
          htmlFor="label"
          className="text-xs font-medium leading-none 
            peer-disabled:cursor-not-allowed 
            peer-disabled:opacity-70">
          Label
        </label>

        <input
          id="label"
          onChange={evt => setLabel(evt.target.value)}
          className="flex h-9 w-full rounded-md border border-input 
            bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-muted-foreground focus-visible:outline-none 
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring 
            disabled:cursor-not-allowed disabled:opacity-50" />
            
        <label 
          htmlFor="description"
          className="text-xs font-medium leading-none mt-2
            peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Description
        </label>

        <textarea 
          id="description"
          className="flex w-full rounded-md border border-input 
            bg-transparent px-3 py-2 text-sm shadow-sm transition-colors 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-muted-foreground focus-visible:outline-none 
            focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring mb-2
            disabled:cursor-not-allowed disabled:opacity-50" 
          rows={3} />
      </div>

      <Accordion
        type="single" 
        collapsible 
        className="w-full bg-muted rounded-md p-3 pb-0">
        <AccordionItem value="schema" className="border-none">
          <AccordionTrigger className="p-0 m-0 pb-3">
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
                  <TableRow className="text-xs">
                    <TableCell className="p-1 w-2/3 pl-0">{p.name}</TableCell>

                    <TableCell className="p-1">{p.type.toUpperCase()}</TableCell>

                    <TableCell className="p-1 pl-6 flex justify-end">
                      <PropertyDetails property={p} />

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

            <Button 
              variant="outline" 
              className="text-xs mt-4 h-8 pl-2 pr-3 font-medium hover:bg-muted-foreground/5" >
              <Plus className="w-4 h-5 mr-1" /> Add Property
            </Button>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-4">
        <Button>Create</Button>
      </div>
    </article>
  )

}