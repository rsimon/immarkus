import { useEffect, useState } from 'react';
import { CopyPlus } from 'lucide-react';
import { PropertyDefinition } from '@/model';
import { Label } from '@/ui/Label';
import { InfoTooltip } from '../InfoTooltip';
import { useValidation } from '../PropertyValidation';
import { GeoCoordinatesFieldInput } from './GeoCoordinatesFieldInput';
import { InheritedFrom } from '../InheritedFrom';

interface GeoCoordinatesFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: [number, number];

  onChange?(value?: [number, number] | [number, number][]): void;

}

const stringify = (coords?: [number, number] | [number, number][]): [string, string][] => {
  if (!coords) return [['', '']];

  if (Array.isArray(coords[0])) {
    // [number, number][]
    return (coords as [number, number][])
      .map(coord => coord.map((c: number) => c.toString())) as [string, string][];
  } else {
    // [number, number]
    const str = (coords as [number, number]).map(c => c.toString()) as [string, string];
    return [str];
  }
}


export const GeoCoordinatesField = (props: GeoCoordinatesFieldProps) => {

  const { definition } = props;

  const [values, setValues] = useState<([string, string] | undefined)[]>(stringify(props.value));

  const { showErrors, isValid } = useValidation(values => {
    const nonEmpty = values.filter(v => v && (v[0] || v[1]));

    const isValidCoordinate = (val: [string, string]) => {
      if (!val) return true;

      if (!val[0] && !val[1]) return true;

      const lat = parseFloat(val[0]);
      const lng = parseFloat(val[1]);

      return !isNaN(lat) && !isNaN(lng);
    }

    return nonEmpty.length === 0 || nonEmpty.every(isValidCoordinate);
  }, [values]);

  useEffect(() => {
    if (!props.onChange) return;

    if (isValid) {
      const validCoordinates = values
        .filter(c => c && c[0] && c[1])
        .map(([lat, lng]) => [parseFloat(lat), parseFloat(lng)]);

      if (validCoordinates.length > 1)
        props.onChange(validCoordinates as [number, number][]);
      else 
        props.onChange(validCoordinates[0] as [number, number]);
    } else {
      props.onChange();
    }
  }, [values, isValid]);

  const error = showErrors && !isValid && 'must be valid coordinates';

  const onChange = (idx: number, updated: [string, string]) =>
    setValues(current => current.map((v, i) => i === idx ? updated : v));

  const onAppendField = () =>
    setValues(current => [...current, undefined]);

  console.log(error);

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between pr-1 mb-1.5">
        <div className="flex items-center gap-1">
          <Label
            className="ml-0.5">
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
          <GeoCoordinatesFieldInput
            key={`${idx}`}
            className={props.className}
            definition={definition} 
            error={Boolean(error)}
            index={idx}
            value={value}
            onChange={value => onChange(idx, value)}/>
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