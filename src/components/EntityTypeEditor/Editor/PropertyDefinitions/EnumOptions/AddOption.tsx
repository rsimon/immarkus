import { useState } from 'react';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';

interface AddOptionProps {

  onAddOption(option: string): void;

}

export const AddOption = (props: AddOptionProps) => {

  const [value, setValue] = useState('');

  const onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter')
      onAddOption();
  }

  const onAddOption = () => {
    if (value)
      props.onAddOption(value);

    setValue('');
  }

  return (
    <>
      <Input 
        className="col-span-5"
        value={value} 
        onChange={evt => setValue(evt.target.value)} 
        onKeyDown={onKeyDown} />

      <Button 
        variant="outline"
        onClick={onAddOption}
        type="button">
        Add
      </Button>
    </>
  )

}