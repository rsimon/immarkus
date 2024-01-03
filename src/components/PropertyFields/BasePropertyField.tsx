import { PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InheritedFrom } from './InheritedFrom';
import { ReactNode } from 'react';

interface BasePropertyFieldProps {

  id: string;

  definition: PropertyDefinition;

  children: ReactNode;

  error?: string;

}

export const BasePropertyField = (props: BasePropertyFieldProps) => {

  return (
    <div className="mb-8">
      <div className="flex justify-between pr-1">
        <div className="flex-shrink-0">
          <Label
            htmlFor={props.id}
            className="text-xs inline-block mb-0.5 ml-0.5 text-muted-foreground">
            {props.definition.name}
          </Label> {!props.error && (<span className="text-xs text-red-600 ml-1">{props.error}</span>)}
        </div>

        <InheritedFrom definition={props.definition} />
      </div>

      {props.children}
    </div>
  )

}