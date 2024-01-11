import { useEffect, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { cn } from '@/ui/utils';
import { InfoTooltip } from '../InfoTooltip';
import { InheritedFrom } from '../InheritedFrom';
import { useValidation } from '../PropertyValidation';

interface GeoCoordinateFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: [number, number];

  onChange?(value: [number, number]): void;

}

export const GeoCoordinateField = (props: GeoCoordinateFieldProps) => {

  const { id, definition, value } = props;

  const [latStr, setLatStr] = useState(value ? value[0].toString() : '');

  const [lngStr, setLngStr] = useState(value ? value[1].toString() : '');

  const { showErrors, isValid } = useValidation((latStr, lngStr) => {
    if (!latStr && !lngStr)
      return true;

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    return !isNaN(lat) && !isNaN(lng);
  }, [latStr, lngStr]);

  useEffect(() => {
    if (latStr && lngStr && isValid && props.onChange) {
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);
      props.onChange && props.onChange([lat, lng]);
    }
  }, [latStr, lngStr, isValid]);

  const error = showErrors && 
    (latStr || lngStr) && !isValid && 'must be a valid coordinate';

  const className = cn(props.className, (error ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

  return (
    <div className="flex justify-between gap-6 items-center mb-8 text-sm mt-10">
      <div className="flex mr-3">
        <Label
          className="ml-0.5">
          {definition.name}
        </Label>

        {definition.description && (
          <InfoTooltip description={definition.description} />
        )}
      </div>

      <div className="relative">
        {error && (
          <span className="absolute text-xs mt-0.5 text-red-600 -top-[1.9em] right-0">{error}</span>
        )}

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
    </div>
  )

}