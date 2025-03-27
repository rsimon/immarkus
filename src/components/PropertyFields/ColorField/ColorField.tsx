import { PropertyDefinition } from '@/model';
import { BasePropertyField } from '../BasePropertyField';
import { removeEmpty } from '../removeEmpty';
import { ColorFieldInput } from './ColorFieldInput';
import { useState } from 'react';

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

  const onChange = (value: string | string[]) => {
    if (props.onChange) {
      const normalized = removeEmpty(value);
      props.onChange(normalized);
    }
  }

  return (
    <BasePropertyField
      id={id}
      definition={definition}
      value={value}
      onChange={onChange}
      render={(value, onChange) => (
        <ColorFieldInput
          className={props.className}
          value={value}
          onChange={onChange} />
      )} />
  )

}