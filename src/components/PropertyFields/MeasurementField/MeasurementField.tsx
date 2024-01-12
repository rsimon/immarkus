import { useEffect, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { InfoTooltip } from '../InfoTooltip';
import { InheritedFrom } from '../InheritedFrom';
import { useValidation } from '../PropertyValidation';
import { cn } from '@/ui/utils';

interface MeasurementFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: { value: number, unit: string };

  onChange?(arg: { value: number, unit: string }): void;

}

export const MeasurementField = (props: MeasurementFieldProps) => {

  const { definition, id } = props;

  const [valueStr, setValueStr] = useState(props.value?.value.toString() || '');

  const [unit, setUnit] = useState(props.value?.unit || '');

  const { showErrors, isValid } = useValidation((valueStr, unit) => {
    if (!valueStr && !unit)
      return true;

    const value = parseFloat(valueStr);
    return !isNaN(value) && Boolean(unit);
  }, [valueStr, unit]);

  useEffect(() => {
    if (valueStr && unit && isValid && props.onChange) {
      const value = parseFloat(valueStr);
      props.onChange && props.onChange({ value, unit });
    }
  }, [valueStr, unit, isValid]);

  const error = showErrors && !isValid && (
    (valueStr && unit) 
      ? 'value must be a number'
      : 'unit required'
  )

  const className = cn(props.className, (error ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

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

          {error && (<span className="text-xs text-red-600 ml-1">{error}</span>)}
        </div>
        
        <InheritedFrom definition={definition} />
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div className="col-span-3">
          <Input 
            id={id} 
            className={className} 
            placeholder="Value..."
            value={valueStr} 
            onChange={evt => setValueStr(evt.target.value)} />
        </div>

        <div>
          <Input 
            id={id} 
            className={className} 
            placeholder="Unit..."
            value={unit} 
            onChange={evt => setUnit(evt.target.value)} />
        </div>
      </div>
    </div>
  )

}