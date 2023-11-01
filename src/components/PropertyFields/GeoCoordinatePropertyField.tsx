import { ChangeEvent, useEffect, useState } from 'react';
import { GeoCoordinateProperty } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';

interface GeoCoordinatePropertyFieldProps {

  id: string;

  property: GeoCoordinateProperty;

  validate?: boolean;

  value?: [number, number];

  onChange?(value: [number, number]): void;

}

export const GeoCoordinatePropertyField = (props: GeoCoordinatePropertyFieldProps) => {

  const { id, property, value, validate, onChange } = props;

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

  return (
    <div className="mb-5">
      <Label
        className="text-xs block mb-2.5">
        {property.name}
      </Label> {property.required && !value ? (
        <span className="text-xs text-red-600 ml-1">required</span>
      ) : !isValid && (
        <span className="text-xs text-red-600 ml-1">must be valid coordinates</span>
      )}

      <div className="flex flex-row gap-2 items-center">
        <Label
          className="text-xs">
          Lat
        </Label> 

        <Input 
          id={id} 
          className={isValid ? "h-8" : "h-8 border-red-500"} 
          value={lonLat[1]} 
          onChange={evt => setLonLat(([lon, _]) => ([lon, parseInput(evt)]))} />

        <Label
          className="text-xs ml-4">
          Lon
        </Label> 

        <Input 
          id={id} 
          className={isValid ? "h-8" : "h-8 border-red-500"} 
          value={lonLat[0]} 
          onChange={evt => setLonLat(([_, lat]) => ([parseInput(evt), lat]))}/>
      </div>
    </div>
  )

}