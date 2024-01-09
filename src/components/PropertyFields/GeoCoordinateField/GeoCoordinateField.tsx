import { ChangeEvent, useEffect, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { cn } from '@/ui/utils';
import { InheritedFrom } from '../InheritedFrom';

interface GeoCoordinateFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  validate?: boolean;

  value?: [number, number];

  onChange?(value: [number, number]): void;

}

export const GeoCoordinateField = (props: GeoCoordinateFieldProps) => {

  const { id, definition, value, validate } = props;

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

  const className = isValid 
    ? props.className
    : cn(props.className, 'border-red-500');

  return (
    <div className="flex justify-between gap-6 items-center mb-8 text-sm mt-10">
      <Label
        className="ml-0.5 mr-3">
        {definition.name}
      </Label>

      <div className="flex items-center gap-2.5">
        <Input 
          id={id} 
          className={className} 
          placeholder="Lat..."
          value={lonLat[1] || ''} 
          onChange={evt => setLonLat(([lon, _]) => ([lon, parseInput(evt)]))} />

        /

        <Input 
          id={id} 
          className={className} 
          placeholder="Lng..."
          value={lonLat[0] || ''} 
          onChange={evt => setLonLat(([_, lat]) => ([parseInput(evt), lat]))}/>

        <InheritedFrom 
          className="mr-1"
          definition={definition} />
      </div>
    </div>
  )

}