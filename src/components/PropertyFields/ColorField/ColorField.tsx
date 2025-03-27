import { useEffect, useState } from 'react';
import { PropertyDefinition } from '@/model';
import { isValidColor } from '@/utils/color';
import { BasePropertyField } from '../BasePropertyField';
import { useValidation } from '../PropertyValidation';
import { removeEmpty } from '../removeEmpty';
import { ColorFieldInput } from './ColorFieldInput';

import './ColorField.css';

interface ColorFieldProps {

  id: string;

  className?: string;

  definition: PropertyDefinition;

  value?: string | string[];

  onChange?(value: string | string[]): void;

}

export const ColorField = (props: ColorFieldProps) => {

  const { id, definition } = props;

  const value = props.onChange ? props.value || '' : props.value;

  const [samplingCount, setSamplingCount] = useState(0);

  const { showErrors, isValid } = useValidation(val => {
    const nonEmpty = (Array.isArray(val) ? val : [val]).filter(Boolean);
    return nonEmpty.length === 0 || nonEmpty.every(isValidColor);
  }, [value]);

  useEffect(() => {
    if (samplingCount > 0)
      document.documentElement.classList.add('color-picker');
    else 
      document.documentElement.classList.remove('color-picker');
  }, [samplingCount]);

  const onChange = (value: string | string[]) => {
    if (props.onChange) {
      const normalized = removeEmpty(value);
      props.onChange(normalized);
    }
  }

  const onSample = (isSampling: boolean) =>
    setSamplingCount(prev => isSampling ? prev + 1 : Math.max(0, prev - 1));

  const error = showErrors && !isValid && 'invalid color code';

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      error={error}
      value={value}
      onChange={onChange}
      render={(value, onChange) => (
        <ColorFieldInput
          className={props.className}
          value={value}
          onSample={onSample}
          onChange={onChange} />
      )} />
  )

}