import { Switch } from '@/ui/Switch';
import { PropertyDefinitionStub } from '../PropertyDefinitionStub';

interface TextOptionsProps {

  definition: PropertyDefinitionStub;

  onUpdate(definition: PropertyDefinitionStub): void;

}

export const TextOptions = (props: TextOptionsProps) => {

  const { definition, onUpdate } = props;

  const onToggleSize = (large: boolean) => large 
    ? onUpdate({ ...definition, size: 'L' })
    : onUpdate({ ...definition, size: undefined });

  return (
    <div className="text-xs flex items-center pt-3 pb-4 px-0.5 gap-2">
      <Switch 
        checked={props.definition.size === 'L'}
        onCheckedChange={onToggleSize} /> 

      Display as multi-line text field
    </div>
  )

}