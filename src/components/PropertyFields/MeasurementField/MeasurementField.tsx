import { useEffect, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InfoTooltip } from '../InfoTooltip';
import { InheritedFrom } from '../InheritedFrom';
import { CopyPlus } from 'lucide-react';
import { Measurement } from './Measurement';
import { MeasurementFieldInput } from './MeasurementFieldInput';
import { useValidation } from '../PropertyValidation';

interface MeasurementFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: Measurement | Measurement[] ;

  onChange?(arg?: Measurement | Measurement[]): void;

}

const stringify = (m?: Measurement | Measurement[]): [string, string][] => {
  if (!m) return [['', '']];

  if (Array.isArray(m))
    return m.map(m => ([m?.value?.toString() || '', m?.unit || '']));
  else
    return [[m?.value?.toString() || '', m?.unit || '']];
}

export const MeasurementField = (props: MeasurementFieldProps) => {

  const { definition } = props;

  const [values, setValues] = useState<([string, string] | undefined)[]>(stringify(props.value));

  const { showErrors, isValid } = useValidation(val => {
    const nonEmpty = val.filter(v => v && (v[0] || v[1]));

    const isValidMeasurement = (val: [string, string]) => {
      if (!val) return true;

      if (!val[0] && !val[1]) return true;

      const value = parseFloat(val[0]);
      return !(isNaN(value) || value.toString().length < val[0].length) && val[1];
    }

    return nonEmpty.length === 0 || nonEmpty.every(isValidMeasurement);
  }, [values]);

  useEffect(() => {
    if (!props.onChange) return;

    if (isValid) {
      const validMeasurements: Measurement[] = values
        .filter(m => m && m[0] && m[1])
        .map(([value, unit]) => ({ value: parseFloat(value), unit }));

      if (validMeasurements.length > 1)
        props.onChange(validMeasurements);
      else 
        props.onChange(validMeasurements[0]);
    } else {
      props.onChange();
    }
  }, [values, isValid]);

  const error = showErrors && !isValid && 'number value and unit required';

  const onChange = (idx: number, updated: [string, string]) =>
    setValues(current => current.map((v, i) => i === idx ? updated : v));

  const onAppendField = () =>
    setValues(current => [...current, undefined]);

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between pr-1 mb-1.5">
        <div className="flex">
          <Label
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

      <div className="flex flex-col gap-2 justify-end">
        {values.map((value, idx) => (
          <MeasurementFieldInput 
            key={`${idx}`}
            className={props.className}
            error={Boolean(error)}
            value={value}
            onChange={value => onChange(idx, value)} />
        ))}

        {props.definition.multiple && (
          <button 
            className="self-end flex gap-1 items-center text-xs text-muted-foreground mt-0.5 mr-0.5"
            type="button"
            onClick={onAppendField}>
            <CopyPlus className="h-3.5 w-3.5 mb-0.5 mr-0.5" /> Add value
          </button>
        )}
      </div>
    </div>
  )

}