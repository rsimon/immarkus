import { ChangeEvent, useState } from 'react';
import { useFormik } from 'formik';
import { X } from 'lucide-react';
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

  const [options, setOptions] = useState<string[]>(property?.type === 'enum' ? property.values : []);

  const [inputValue, setInputValue] = useState('');

  const formik = useFormik({
    initialValues: {
      name: property?.name || '',
      type: property?.type || '' as 'enum' |  'geocoordinate' | 'number' | 'text' | 'uri'
    },

    onSubmit: ({ name, type }) => {
      props.onUpdate({ 
        type, 
        name, 
        values: type === 'enum' && options 
      });
    },

    validate: ({ name, type }) => {
      if (!(name && type))
        return { type: 'Required' };
    }
  });

  const onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter')
      onAddOption();
  }

  const onChangeInput = (evt: ChangeEvent<HTMLInputElement>) => {
    setInputValue(evt.target.value)
  }

  const onAddOption = () => {
    if (inputValue)
      setOptions(opts => ([...opts, inputValue].slice().sort()));

    setInputValue('');
  }
  
  const onRemoveOption = (option: string) => () =>
    setOptions(opts => opts.filter(o => o !== option));

  return (
    <form className="grid gap-2 pt-4" onSubmit={formik.handleSubmit}>
      <Label 
        htmlFor="name"
        className="text-sm">
        Name
      </Label>

      <Input 
        id="name" 
        value={formik.values.name} 
        onChange={formik.handleChange}/>

      <Label 
        htmlFor="type"
        className="text-sm mt-3">
        Type
      </Label>

      <Select
        value={formik.values.type}
        onValueChange={t => formik.setFieldValue('type', t)}>
        <SelectTrigger className="w-full h-10">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="text">Text</SelectItem>
          <SelectItem value="number">Number</SelectItem>
          <SelectItem value="enum">Options</SelectItem>
          <SelectItem value="uri">URI</SelectItem>
          <SelectItem value="geocoordinate">Coordinate</SelectItem>
        </SelectContent>
      </Select>

      {formik.values.type === 'enum' && (
        <div className="bg-muted p-2 mt-2 rounded-md">
          <div className="mt-2 mb-3 col-span-5">
            {options.length === 0 ? (
              <div className="flex py-3 text-muted-foreground text-xs justify-center">
                Add at least one option.
              </div>
            ) : (
              <ul className="px-2 text-xs text-muted-foreground">
                {options.map(option => (
                  <li 
                    className="flex justify-between p-1 border-b last:border-none"
                    key={option}>
                    <span>{option}</span>

                    <Button 
                      onClick={onRemoveOption(option)}
                      className="align-middle w-6 h-6"
                      variant="ghost"
                      type="button"
                      size="icon">
                      <X className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-6 gap-2">            
            <Input 
              className="col-span-5"
              value={inputValue} 
              onChange={onChangeInput} 
              onKeyDown={onKeyDown} />

            <Button 
              variant="outline"
              onClick={onAddOption}
              type="button">
              Add
            </Button>
          </div>
        </div>
      )}

      <div className="mt-3 sm:justify-start">
        <Button type="button" onClick={formik.submitForm}>Save</Button>
      </div>
    </form>
  )

}