import { ReactNode } from 'react';
import { PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InfoTooltip } from './InfoTooltip';
import { InheritedFrom } from './InheritedFrom';

interface BasePropertyFieldProps {

  id: string;

  definition: PropertyDefinition;

  children: ReactNode;

  error?: string;

}

export const BasePropertyField = (props: BasePropertyFieldProps) => {

  const { definition } = props;

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between pr-1 mb-1.5">
        <div className="flex">
          <Label
            htmlFor={props.id}
            className="text-sm inline-block ml-0.5 ">
            {definition.name}
          </Label>

          {definition.description && (
            <InfoTooltip description={definition.description} />
          )}

          {!props.error && (<span className="text-xs text-red-600 ml-1">{props.error}</span>)}
        </div>
        
        <InheritedFrom definition={definition} />
      </div>

      {props.children}
    </div>
  )

}