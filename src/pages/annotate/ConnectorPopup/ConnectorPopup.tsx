import { useMemo } from 'react';
import { ConnectionPopupProps } from '@annotorious/plugin-connectors-react';
import { Combobox } from '@/components/Combobox';
import { useDataModel } from '@/store';

export const ConnectorPopup = (props: ConnectionPopupProps) => {

  const model = useDataModel();

  console.log(props.annotation);

  const options = useMemo(() => {
    return model.relationshipTypes.map(t => ({ label: t, value: t }));
  }, [model]);

  const selected = useMemo(() => {
    const value = props.annotation.bodies.find(b => b.purpose === 'tagging')?.value;
    if (value)
      return { value, label: value };
  }, [options, props.annotation]);

  const onChange = ({ value }) => {
    const existing = props.annotation.bodies.find(b => b.purpose === 'tagging');
    if (existing) {
      props.onUpdateBody(existing, { purpose: 'tagging', value });
    } else {
      props.onCreateBody({ purpose: 'tagging', value });
    }
  }

  return (
    <div className="bg-white">
      <Combobox
        className="w-56"
        value={selected}
        options={options}
        onChange={onChange} />
    </div>
  )


}