import { W3CAnnotationBody } from '@annotorious/react';
import { useFormik } from 'formik';
import { Entity } from '@/model';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/ui/Select';

interface EntitySchemaFieldsProps {

  entity: Entity;

  safeKeys: [string, string][];

  formik: ReturnType<typeof useFormik>;

}

export const EntitySchemaFields = (props: EntitySchemaFieldsProps) => {

  const { entity, safeKeys, formik } = props;

  const getKey = (name: string) =>
    safeKeys.find(([_, n]) => n === name)[0];
  
  return (entity.schema || []).map(property => (
    <div className="mt-1" key={getKey(property.name)}>
      <Label 
        htmlFor={getKey(property.name)}
        className="text-xs">
        {property.name}
      </Label>

      {property.type === 'enum' ? (
        <Select 
          value={formik.values[getKey(property.name)]}
          onValueChange={formik.handleChange}>
          
          <SelectTrigger className="w-full h-8 mt-0.5">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            {property.values.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input 
          id={getKey(property.name)} 
          className="h-8 mt-0.5" 
          value={formik.values[getKey(property.name)]} 
          onChange={formik.handleChange}/>
      )}
    </div>
  ))

}