import { useEffect, useMemo, useState } from 'react';
import { useDataModel } from '@/store';
import { Combobox, ComboboxOption } from '../Combobox';

interface EntityTypeSelectorProps {

  value?: string;

  onChange?(type: string): void;

}

export const EntityTypeSelector = (props: EntityTypeSelectorProps) => {

  const { entityTypes } = useDataModel();

  const getOption = (id?: string) => {
    if (id) {
      const t = entityTypes.find(t => t.id === id);
      if (t)
        return { label: t.label || t.id, value: t.id };
    }
  }

  const [value, setValue] = useState<ComboboxOption>(getOption(props.value));

  const options = useMemo(() => (
    entityTypes.map(t => ({ label: t.label || t.id, value: t.id }))
  ), [entityTypes]);

  useEffect(() => {
    if (value)
      props.onChange(entityTypes.find(t => t.id === value.value)?.id);
  }, [value]);

  return (
    <Combobox
      className="w-full mt-2"
      value={value}
      options={options}
      onChange={setValue} />
  )

}