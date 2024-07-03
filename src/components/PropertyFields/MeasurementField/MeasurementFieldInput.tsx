import { useEffect, useState } from 'react';
import { Input } from '@/ui/Input';
import { cn } from '@/ui/utils';
import { Measurement } from './Measurement';

interface MeasurementFieldInputProps {

  className?: string;

  error?: boolean;

  value?: [string, string];

  onChange?(arg?: [string, string]): void;

}

export const MeasurementFieldInput = (props: MeasurementFieldInputProps) => {

  const [valueStr, unit] = props.value ? props.value : ['', ''];

  const className = cn(props.className, (props.error ? 'mt-0.5 outline-red-500 border-red-500' : 'mt-0.5'));

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="col-span-3">
        <Input 
          className={className} 
          placeholder="Value..."
          value={valueStr} 
          onChange={evt => props.onChange([evt.target.value, unit])} />
      </div>

      <div>
        <Input 
          className={className} 
          placeholder="Unit..."
          value={unit} 
          onChange={evt => props.onChange([valueStr, evt.target.value])} />
      </div>
    </div>
  )

}