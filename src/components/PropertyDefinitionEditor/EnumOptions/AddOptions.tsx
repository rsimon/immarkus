import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { useToast } from '@/ui/Toaster';

interface AddOptionsProps {

  onAddOptions(option: string[]): void;

}

export const AddOptions = (props: AddOptionsProps) => {

  const { t } = useTranslation('common');

  const [value, setValue] = useState('');

  const { toast } = useToast();

  const onKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter')
      onAddOneOption();
  }

  const onAddOneOption = () => {
    if (value)
      props.onAddOptions([value]);

    setValue('');
  }

  const onPaste = (evt: React.ClipboardEvent<HTMLInputElement>) => {
    const text = evt.clipboardData.getData('text/plain');

    const lines = text
      .split(/\r\n|\n|\r/)
      .map(line => line.split('\t')[0]) // If multiple columns, just take the first
      .map(line => line.trim())
      .filter(Boolean);

    if (lines.length > 100) {
      evt.preventDefault(); // Stop native paste behavior

      toast({
        title: t('propertyDefinitionEditor.tooManyOptions'),
        description:t('propertyDefinitionEditor.tooManyOptionsMessage'),
        duration: 10000 // ms
      });
    } else if (lines.length > 1) {
      evt.preventDefault();
      props.onAddOptions(lines);
      setValue('');
    }
    // Single line? Do nothing (just gets pasted into the input)
  }

  return (
    <>
      <Input 
        className="col-span-5 bg-white shadow-none"
        value={value} 
        placeholder={t('propertyDefinitionEditor.typeOrPasteOptions')}
        onChange={evt => setValue(evt.target.value)} 
        onKeyDown={onKeyDown} 
        onPaste={onPaste} />

      <Button 
        variant="outline"
        onClick={onAddOneOption}
        type="button"
        className="h-9">
        {t('propertyDefinitionEditor.add')}
      </Button>
    </>
  )

}