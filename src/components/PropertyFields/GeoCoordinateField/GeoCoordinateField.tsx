import { useEffect, useState } from 'react';
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

  const [latStr, setLatStr] = useState(value ? value[0].toString() : '');

  const [lngStr, setLngStr] = useState(value ? value[1].toString() : '');

  useEffect(() => {
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    if (!isNaN(lat) && !isNaN(lng))
      props.onChange && props.onChange([lat, lng]);
  }, [latStr, lngStr]);

  const error = definition.required && !value 
    ? 'required' : !value && 'must be a valid geo-coordinate';

  const className = error 
    ? cn(props.className, 'border-red-500')
    : props.className

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
          value={latStr} 
          onChange={evt => setLatStr(evt.target.value)} />

        /

        <Input 
          id={id} 
          className={className} 
          placeholder="Lng..."
          value={lngStr} 
          onChange={evt => setLngStr(evt.target.value)} />

        <InheritedFrom 
          className="mr-1"
          definition={definition} />
      </div>
    </div>
  )

}