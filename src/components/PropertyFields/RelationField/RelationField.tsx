import { PropertyDefinition } from '@/model';
import { BasePropertyField } from '../BasePropertyField';
import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';

interface RelationFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: string;

  onChange?(value: string): void;

}

export const RelationField = (props: RelationFieldProps) => {

  const className = cn(props.className, 'mt-0.5');

  return (
    <BasePropertyField 
      id={props.id}
      definition={props.definition}>

      <Input className={className} />

    </BasePropertyField>
  );

}