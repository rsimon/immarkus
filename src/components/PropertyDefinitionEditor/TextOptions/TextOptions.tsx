import { TextPropertyDefinition } from '@/model';
import { Switch } from '@/ui/Switch';

interface TextOptionsProps {

  definition: Partial<TextPropertyDefinition>;

  onUpdate(definition: Partial<TextPropertyDefinition>): void;

}

export const TextOptions = (props: TextOptionsProps) => {

  const { definition, onUpdate } = props;

  const onToggleSize = (large: boolean) => large 
    ? onUpdate({ ...definition, size: 'L' })
    : onUpdate({ ...definition, size: undefined });

  return (
    <div className="text-xs flex items-center pt-4 px-0.5 gap-3">
      <Switch 
        checked={props.definition.size === 'L'}
        onCheckedChange={onToggleSize} /> 

      Display as multi-line text field
    </div>
  )

}