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
import { createSafeKeys } from './PropertyKeys';
import { W3CAnnotationBody } from '@annotorious/react';

interface EntitySchemaFieldsProps {

  body: W3CAnnotationBody,

  entity: Entity;

  safeKeys: ReturnType<typeof createSafeKeys>;

  formik: ReturnType<typeof useFormik>;

}

export const EntitySchemaFields = (props: EntitySchemaFieldsProps) => {

  const { body, entity, safeKeys, formik } = props;
  
  return (entity.schema || []).map(property => (
    <div className="mt-2" key={safeKeys.getKey(body, property.name)}>
      <Label 
        htmlFor={safeKeys.getKey(body, property.name)}
        className="text-xs block mb-1 mt-3">
        {property.name}
      </Label>

      {property.type === 'enum' ? (
        <Select 
          value={formik.values[safeKeys.getKey(body, property.name)]}
          onValueChange={value => 
            formik.handleChange(safeKeys.getKey(body, property.name))(value)}>
          
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
          id={safeKeys.getKey(body, property.name)} 
          className="h-8 mt-0.5" 
          value={formik.values[safeKeys.getKey(body, property.name)]} 
          onChange={formik.handleChange}/>
      )}
    </div>
  ))

}