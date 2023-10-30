import { useFormik } from 'formik';
import { Label } from '@/ui/Label';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/ui/Select';
import { EnumProperty } from '@/model';
import { W3CAnnotationBody } from '@annotorious/react';
import { createSafeKeys } from '../PropertyKeys';

interface EnumFieldProps extends EnumProperty {

  body?: W3CAnnotationBody;

  safeKeys: ReturnType<typeof createSafeKeys>;

  formik: ReturnType<typeof useFormik>;

}

export const EnumField = (props: EnumFieldProps) => {

  const { name, values, body, formik, safeKeys } = props;

  return (
    <>
      <Label 
        htmlFor={safeKeys.getKey(body, name)}
        className="text-xs block mb-1 mt-3">
        {name}
      </Label>

      <Select 
        value={formik.values[safeKeys.getKey(body, name)]}
        onValueChange={value => 
          formik.handleChange(safeKeys.getKey(body, name))(value || '')}>
        
        <SelectTrigger className="w-full h-8 mt-0.5">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value={null}>&nbsp;</SelectItem>

          {values.map(option => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )

}