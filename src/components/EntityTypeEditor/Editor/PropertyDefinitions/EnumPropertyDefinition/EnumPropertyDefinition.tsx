import { Button } from '@/ui/Button';
import { X } from 'lucide-react';
import { PropertyDefinitionStub } from '../PropertyDefinitionStub';
import { AddOption } from './AddOption';

interface EnumPropertyDefinitionProps {

  definition: PropertyDefinitionStub;

  onAddOption(option: string): void;

  onRemoveOption(option: string): void;

}

export const EnumPropertyDefinition = (props: EnumPropertyDefinitionProps) => {

  const { definition } = props;

  return (
    <div className="bg-muted p-2 mt-3 rounded-md">
      <div className="mt-1 mb-2 col-span-5">
        {!(definition.values?.length > 0) ? (
          <div className="flex py-3 text-muted-foreground text-xs justify-center">
            Add at least one option.
          </div>
        ) : (
          <ul className="px-2 text-xs text-muted-foreground">
            {definition.values.map(option => (
              <li 
                className="flex justify-between p-1 border-b last:border-none"
                key={option}>
                <span>{option}</span>

                <Button 
                  onClick={() => props.onRemoveOption(option)}
                  className="align-middle w-6 h-6"
                  variant="ghost"
                  type="button"
                  size="icon">
                  <X className="w-3 h-3" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-6 gap-2"> 
        <AddOption onAddOption={props.onAddOption} /> 
      </div>
    </div>
  )

}