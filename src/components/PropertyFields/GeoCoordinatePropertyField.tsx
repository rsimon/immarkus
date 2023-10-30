import { GeoCoordinateProperty } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';

interface GeoCoordinatePropertyFieldProps {

  id: string;

  property: GeoCoordinateProperty;

  validate?: boolean;

  value?: string;

  onChange?(value: number): void;

}

export const GeoCoordinatePropertyField = (props: GeoCoordinatePropertyFieldProps) => {

  const { id, property, value, validate, onChange } = props;

  const isValidCoordinate = () => {

  }

  const isValid = !validate || isValidCoordinate();

  return (
    <>
      <Label
        className="text-xs block mb-1 mt-3">
        {property.name}
      </Label> {property.required && !value ? (
        <span className="text-xs text-red-600 ml-1">required</span>
      ) : !isValid && (
        <span className="text-xs text-red-600 ml-1">must be valid coordinates</span>
      )}

      <div>
        <Label
          className="text-xs block mb-1 mt-3">
          Lat
        </Label> 

        <Input 
          id={id} 
          className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
          value={value} 
          onChange={evt => onChange(parseFloat(evt.target.value))} />

        <Label
          className="text-xs block mb-1 mt-3">
          Lon
        </Label> 

        <Input 
          id={id} 
          className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
          value={value} 
          onChange={evt => onChange(parseFloat(evt.target.value))} />
      </div>
    </>
  )

}