import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { FontSize, FontSizeButton } from '@/components/FontSize';
import { TranslateButton, Translation, TranslationArgs, TranslationSettings } from '@/components/Translation';
import { TextPropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';
import { BasePropertyField } from '../BasePropertyField';
import { removeEmpty } from '../removeEmpty';

interface TextFieldProps {

  id: string;

  className?: string;

  definition: TextPropertyDefinition;

  value?: string | string[];

  onChange?(value: string | string[]): void;

}

export const TextField = (props: TextFieldProps) => {

  const { id, definition } = props;

  const value = props.onChange ? props.value || '' : props.value;

  const [fontsize, setFontSize] = useState<FontSize>('base');

  const [translationArgs, setTranslationArgs] = useState<TranslationArgs | undefined>();

  const onChange = (value: string | string[]) => {
    if (props.onChange) {
      setTranslationArgs(undefined);

      const normalized = removeEmpty(value);
      props.onChange(normalized);
    }
  }

  const onTranslate = (settings: TranslationSettings, value: string) => setTranslationArgs({ 
    connector: settings.connector,
    service: settings.service, 
    text: value,
    language: settings.language
  });

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      value={value}
      onChange={onChange}
      render={(value, onChange) => definition.size === 'L' ? (
        <div className="w-full">
          <TextareaAutosize 
            id={id} 
            cacheMeasurements
            minRows={4}
            maxRows={20}
            className={cn(
              'shadow-xs w-full outline-black rounded-md bg-muted border border-input p-2 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50', 
              props.className,
              `text-${fontsize}`
            )} 
            value={props.onChange ? value || '' : value} 
            onChange={evt => props.onChange && onChange(evt.target.value)} />

          {translationArgs && (
            <Translation 
              args={translationArgs}
              onClose={() => setTranslationArgs(undefined)} />
          )}
          
          <div className="flex justify-end mt-0.5 text-muted-foreground">
            <FontSizeButton
              disabled={!props.value}
              onChangeFontSize={setFontSize} />

            <TranslateButton
              disabled={!props.onChange || !value}
              onClickTranslate={settings => onTranslate(settings, value)} />
          </div>
        </div>
      ) : (
        <Input 
          id={id} 
          className={cn(props.className, 'mt-0.5')} 
          value={props.onChange ? value || '' : value} 
          onChange={evt => props.onChange && onChange(evt.target.value)} />
      )} />
  )

}