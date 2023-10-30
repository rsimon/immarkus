import { URIProperty } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';

interface URIPropertyFieldProps {

  id: string;

  property: URIProperty;

  validate?: boolean;

  value: string;

  onChange(value: string): void;

}

export const URIPropertyField = (props: URIPropertyFieldProps) => {

  const { id, property, value, validate, onChange } = props;

  const isValidURL = (str: string) => {
    let url: URL;
  
    try {
      url = new URL(str);
    } catch (_) {
      return false;  
    }
  
    return url.protocol === "http:" || url.protocol === "https:";
  }

  const isValid = !validate || isValidURL(value);

  return (
    <>
      <Label 
        htmlFor={id}
        className="text-xs block mb-1 mt-3">
        {property.name}
      </Label> {property.required && !value ? (
        <span className="text-xs text-red-600 ml-1">required</span>
      ) : !isValid && (
        <span className="text-xs text-red-600 ml-1">must be a URI</span>
      )}

      <Input 
        id={id} 
        className={isValid ? "h-8 mt-0.5" : "h-8 mt-0.5 border-red-500"} 
        value={value} 
        onChange={evt => onChange(evt.target.value)} />
    </>
  )

}