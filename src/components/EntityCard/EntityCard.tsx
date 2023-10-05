import { Entity } from '@/model';
import { Button } from '../Button';

export interface EntityCardProps {

  entity?: Entity;

}

export const EntityCard = (props: EntityCardProps) => {

  return (
    <article className="p-6 pt-0 grid gap-4" style={{ margin: 40, width: 300 }}>
      <h1>Hello World</h1>
      <div className="grid grid-cols-2 gap-2">
        <div>
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

        <div>
          <label 
            className="text-sm font-medium leading-none 
              peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Color
          </label>

          <input 
            className="flex h-9 w-full rounded-md border border-input 
              bg-transparent px-3 py-1 text-sm shadow-sm transition-colors 
              file:border-0 file:bg-transparent file:text-sm file:font-medium 
              placeholder:text-muted-foreground focus-visible:outline-none 
              focus-visible:ring-1 focus-visible:ring-ring 
              disabled:cursor-not-allowed disabled:opacity-50" />
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