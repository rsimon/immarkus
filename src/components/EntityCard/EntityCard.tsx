import { useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { Entity } from '@/model';
import { Button } from '../Button';

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

  return (
    <article className="p-6 pt-0 grid gap-4" style={{ margin: 40, width: 300 }}>
      <h1>Entity Preview</h1>
      <div className="grid grid-cols-7 gap-2">
        <div className="col-span-3">
          <label 
            className="text-sm font-medium 
              leading-none peer-disabled:cursor-not-allowed 
              peer-disabled:opacity-70">
            ID
          </label>

          <input 
            className="flex h-9 w-full rounded-md border border-input 
              bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
              file:border-0 file:bg-transparent file:text-sm file:font-medium 
              placeholder:text-muted-foreground focus-visible:outline-none 
              focus-visible:ring-1 focus-visible:ring-ring 
              disabled:cursor-not-allowed disabled:opacity-50" />
        </div>

        <div className="col-span-4">
          <label 
            className="text-sm font-medium leading-none 
              peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Color
          </label>

          <div className="grid grid-cols-4 gap-8">
            <Button 
              variant="ghost" 
              size="icon" 
              className={getBrightness(color) < 0.9 ? 'h-9 w-9' : 'h-9 w-9 border shadow-sm'}
              style={{ 
                backgroundColor: color,
                color: getBrightness(color) > 0.5 ? '#000' : '#fff' 
              }}
              onClick={() => setColor(getRandomColor())}>
              <RefreshCcw className="h-4 w-4" />
            </Button>

            <input 
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

      <div className="grid gap-2">
        <label 
          className="text-sm font-medium leading-none 
            peer-disabled:cursor-not-allowed 
            peer-disabled:opacity-70">
          Label
        </label>

        <input 
          className="flex h-9 w-full rounded-md border border-input 
            bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-muted-foreground focus-visible:outline-none 
            focus-visible:ring-1 focus-visible:ring-ring 
            disabled:cursor-not-allowed disabled:opacity-50" />
            
        <label 
          className="text-sm font-medium leading-none 
            peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Description
        </label>

        <textarea 
          className="flex w-full rounded-md border border-input 
            bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
            file:border-0 file:bg-transparent file:text-sm file:font-medium 
            placeholder:text-muted-foreground focus-visible:outline-none 
            focus-visible:ring-1 focus-visible:ring-ring 
            disabled:cursor-not-allowed disabled:opacity-50" 
          rows={5} />
      </div>

      <div>
        <Button>Create</Button>
      </div>
    </article>
  )

}