import { Button } from '@/ui/Button';
import { X } from 'lucide-react';
import { PropertyDefinitionStub } from '../PropertyDefinitionStub';
import { AddOption } from './AddOption';

interface EnumOptionsProps {

  definition: PropertyDefinitionStub;

  onUpdate(definition: PropertyDefinitionStub): void;

}

export const EnumOptions = (props: EnumOptionsProps) => {

  const { definition } = props;

  const onAddOption = (option: string) => 
    props.onUpdate({
      ...definition, 
      values: [ ...(definition.values || []),  option].slice().sort()
    });

  const onRemoveOption = (option: string) => () =>
    props.onUpdate({
      ...definition, 
      values: (definition.values || []).filter(o => o !== option)
    });

  return (
    <div className="bg-muted p-2 mt-2 rounded-md">
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
                  onClick={onRemoveOption(option)}
                  className="align-middle w-5 h-5 my-0.5"
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
        <AddOption onAddOption={onAddOption} /> 
      </div>
    </div>
  )

}