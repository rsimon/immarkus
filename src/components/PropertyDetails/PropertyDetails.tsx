import { useFormik } from 'formik';
import { EntityProperty } from '@/model';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

interface PropertyDetailsProps {

  property?: EntityProperty;

  onUpdate(updated: EntityProperty): void;

}

export const PropertyDetails = (props: PropertyDetailsProps) => {

  const { property } = props;

  const formik = useFormik({
    initialValues: {
      name: property?.name || '',
      type: property?.type || '' as 'string' | 'number' | 'enum'
    },

    onSubmit: ({ name, type }) => {
      props.onUpdate({ type, name, values: type === 'enum' && [] })
    },

    validate: ({ type }) => {
      if (!type)
        return { type: 'Required' };
    }
  });

  return (
    <form className="grid gap-2 pt-4" onSubmit={formik.handleSubmit}>
      <Label 
        htmlFor="name"
        className="text-sm">
        Property Name
      </Label>

      <Input 
        id="name" 
        value={formik.values.name} 
        onChange={formik.handleChange}/>

      <Label 
        htmlFor="type"
        className="text-sm">
        Property Type
      </Label>

      <Select
        value={formik.values.type}
        onValueChange={t => formik.setFieldValue('type', t)}>
        <SelectTrigger className="w-full h-10 shadow-sm">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="string">Text</SelectItem>
          <SelectItem value="number">Number</SelectItem>
          <SelectItem value="enum">Choice</SelectItem>
        </SelectContent>
      </Select>

      <div className="mt-2 sm:justify-start">
        <Button type="submit">Save</Button>
      </div>
    </form>
  )

}