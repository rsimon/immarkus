import { useTranslation } from 'react-i18next';
import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';
import { PropertyDefinition } from '@/model';
import { InheritedFrom } from '../InheritedFrom';

interface RangeFieldInputProps {

  className?: string;

  definition?: PropertyDefinition;

  error?: boolean;

  value?: [string, string];

  onChange(arg?: [string, string]): void;

}

export const RangeFieldInput = (props: RangeFieldInputProps) => {

  const { t } = useTranslation('common');

  const [startStr, endStr] = props.value ? props.value : ['', ''];

  const className = cn(props.className, (props.error ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

  return (
    <div className="flex items-center gap-2.5">
      <Input 
        className={className} 
        placeholder={t('propertyFields.startPlaceholder')}
        value={startStr} 
        onChange={evt => props.onChange([evt.target.value, endStr])} />

      –

      <Input 
        className={className} 
        placeholder={t('propertyFields.endPlaceholder')}
        value={endStr} 
        onChange={evt => props.onChange([startStr, evt.target.value])} />
    </div>
  )

}