import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { FontSize, FontSizeButton } from '@/components/FontSize';
import { TranslateButton, Translation, TranslationArgs, TranslationSettings } from '@/components/Translation';
import { TextPropertyDefinition } from '@/model';
import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';
import { CopyPlus } from 'lucide-react';

interface TextFieldInputProps {

  className?: string;

  definition: TextPropertyDefinition;

  isLast?: boolean;

  value?: string;

  onAppendField(): void;

  onChange?(value: string): void;

}

export const TextFieldInput = (props: TextFieldInputProps) => {

  const { definition } = props;

  const value = props.onChange ? props.value || '' : props.value;

  const [fontsize, setFontSize] = useState<FontSize>('base');

  const [translationArgs, setTranslationArgs] = useState<TranslationArgs | undefined>();

  const onChange = (value: string) => {
    if (props.onChange) {
      setTranslationArgs(undefined);
      props.onChange(value);
    }
  }

  const onTranslate = (settings: TranslationSettings, value: string) => setTranslationArgs({ 
    connector: settings.connector,
    service: settings.service, 
    text: value,
    language: settings.language
  });

  return definition.size === 'L' ? (
    <div className="w-full">
      <TextareaAutosize
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
      
      <div className="flex justify-end items-center mt-0.5 text-muted-foreground">
        <FontSizeButton
          disabled={!props.value}
          onChangeFontSize={setFontSize} />

        <TranslateButton
          disabled={!props.onChange || !value}
          onClickTranslate={settings => onTranslate(settings, value)} />

        {(props.definition.multiple && props.isLast) && (
          <button 
            className="flex gap-1 items-center text-xs text-muted-foreground ml-1"
            onClick={props.onAppendField}
            type="button">
            <CopyPlus className="h-3.5 w-3.5 mb-0.5 mr-0.5" /> Add value
          </button>
        )}
      </div>
    </div>
  ) : (
    <Input
      className={cn(props.className, 'mt-0.5')} 
      value={props.onChange ? value || '' : value} 
      onChange={evt => props.onChange && onChange(evt.target.value)} />
  )
  
}