import { ChangeEvent, useEffect, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { BasePropertyField } from '../BasePropertyField';
import { cn } from '@/ui/utils';

interface GeoCoordinateFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  validate?: boolean;

  value?: [number, number];

  onChange?(value: [number, number]): void;

}

export const GeoCoordinateField = (props: GeoCoordinateFieldProps) => {

  const { id, definition, value, validate, onChange } = props;

  const [lonLat, setLonLat] = useState<[number | undefined, number | undefined]>(value || [undefined, undefined]);

  useEffect(() => {
    if (props.onChange)
      props.onChange(lonLat);
  }, [lonLat]);

  const isValidCoordinate = () => {

  }

  const parseInput = (evt: ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(evt.target.value);
    return isNaN(parsed) ? undefined : parsed;
  }

  const isValid = !validate || isValidCoordinate();

  const error = definition.required && !value 
    ? 'required' : !isValid && 'must be a valid geo-coordinate';

  const className = isValid ? props.className : cn(props.className, 'border-red-500');

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      error={error}>
      
      <div className="flex flex-row gap-2 items-center">
        <Label
          className="text-xs">
          Lat
        </Label> 

        <Input 
          id={id} 
          className={className} 
          value={lonLat[1] || ''} 
          onChange={evt => setLonLat(([lon, _]) => ([lon, parseInput(evt)]))} />

        <Label
          className="text-xs ml-4">
          Lon
        </Label> 

        <Input 
          id={id} 
          className={className} 
          value={lonLat[0] || ''} 
          onChange={evt => setLonLat(([_, lat]) => ([parseInput(evt), lat]))}/>
      </div>
    </BasePropertyField>
  )

}