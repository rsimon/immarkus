import { useMemo } from 'react';
import { ConnectionPopupProps } from '@annotorious/plugin-connectors-react';
import { Combobox } from '@/components/Combobox';
import { useDataModel } from '@/store';

import './ConnectorPopup.css';

export const ConnectorPopup = (props: ConnectionPopupProps) => {

  const model = useDataModel();

  const options = useMemo(() => {
    return model.relationshipTypes.map(t => ({ label: t, value: t }));
  }, [model]);

  const selected = useMemo(() => {
    const value = props.annotation.bodies.find(b => b.purpose === 'tagging' || !('purpose' in b))?.value;
    if (value)
      return { value, label: value };
  }, [options, props.annotation]);

  const onChange = ({ value }) => {
    const existing = props.annotation.bodies.find(b => b.purpose === 'tagging' || !('purpose' in b));
    if (existing)
      props.onUpdateBody(existing, { purpose: 'tagging', value });
    else
      props.onCreateBody({ purpose: 'tagging', value });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <Combobox
        autofocus={(props.annotation.bodies || []).length === 0}
        className="w-[196px] p-2"
        value={selected}
        options={options}
        onChange={onChange} />
    </div>
  )


}