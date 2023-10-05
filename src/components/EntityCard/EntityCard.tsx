import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Entity } from '@/model';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/Accordion';
import { Button } from '@/components/Button';
import { Separator } from '@/components/Separator';


export interface EntityCardProps {

  entity?: Entity;

}

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

export const EntityCard = (props: EntityCardProps) => {

  const [color, setColor] = useState(props.entity?.color || getRandomColor());

  const [schemaOpen, setSchemaOpen] = useState(false);

  const brightness = getBrightness(color);

  return (
    <article style={{ margin: 40, width: 300 }}>
      <div className="flex justify-center">
        <h2 
          className="rounded-full px-2.5 py-1 text-xs"
          style={{ 
            backgroundColor: color,
            color: brightness > 0.5 ? '#000' : '#fff' 
          }}>
          Entity Preview
        </h2>
      </div>

      <Separator className="mt-4" />

      <div className="grid grid-cols-7 gap-2 mt-2 mb-3">
        <div className="col-span-3">
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
              focus-visible:ring-1 focus-visible:ring-ring 
              disabled:cursor-not-allowed disabled:opacity-50" />
        </div>

        <div className="col-span-4">
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
              className="col-span-3 flex h-9 w-full rounded-md border border-input 
                bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
                file:border-0 file:bg-transparent file:text-sm file:font-medium 
                placeholder:text-muted-foreground focus-visible:outline-none 
                focus-visible:ring-1 focus-visible:ring-ring 
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
          className="flex h-9 w-full rounded-md border border-input 
            bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-muted-foreground focus-visible:outline-none 
            focus-visible:ring-1 focus-visible:ring-ring 
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
            bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-muted-foreground focus-visible:outline-none 
            focus-visible:ring-1 focus-visible:ring-ring 
            disabled:cursor-not-allowed disabled:opacity-50" 
          rows={5} />
      </div>

      <Accordion
        onValueChange={value => setSchemaOpen(Boolean(value))}
        type="single" 
        collapsible 
        className="w-full">
        <AccordionItem value="schema">
          <AccordionTrigger>
            <div className="flex flex-col items-start">
              <h3 className="text-xs">
                Entity schema
              </h3>

              {!schemaOpen && (
                <div className="text-sm mt-1.5 text-muted-foreground">No schema defined</div>
              )}
            </div>
          </AccordionTrigger>

          <AccordionContent>
            TODO
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-4">
        <Button>Create</Button>
      </div>
    </article>
  )

}