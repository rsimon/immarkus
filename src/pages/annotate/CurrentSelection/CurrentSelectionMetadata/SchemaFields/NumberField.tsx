import { useFormik } from 'formik';
import { W3CAnnotationBody } from '@annotorious/react';
import { NumberProperty } from '@/model';
import { createSafeKeys } from '../PropertyKeys';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';

interface NumberFieldProps extends NumberProperty{

  body?: W3CAnnotationBody;

  safeKeys: ReturnType<typeof createSafeKeys>;

  formik: ReturnType<typeof useFormik>;

}

export const NumberField = (props: NumberFieldProps) => {

  const { name, body, formik, safeKeys } = props;

  return (
    <>
      <Label 
        htmlFor={safeKeys.getKey(body, name)}
        className="text-xs block mb-1 mt-3">
        {name}
      </Label>

      <Input 
        id={safeKeys.getKey(body, name)} 
        className="h-8 mt-0.5" 
        value={formik.values[safeKeys.getKey(body, name)]} 
        onChange={formik.handleChange}/>
    </>
  )

}