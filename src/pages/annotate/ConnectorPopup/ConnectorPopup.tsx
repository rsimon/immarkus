import { useMemo, useState } from 'react';
import { CirclePlus, Plus } from 'lucide-react';
import { ConnectionPopupProps } from '@annotorious/plugin-connectors-react';
import { Combobox, ComboboxState } from '@/components/Combobox';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';

import './ConnectorPopup.css';

export const ConnectorPopup = (props: ConnectionPopupProps) => {

  const model = useDataModel();

  const [addTerm, setAddTerm] = useState<string | undefined>();

  const options = useMemo(() => {
    return model.relationshipTypes.map(t => ({ label: t.name, value: t.name }));
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

  const onComboboxStateChange = (state: ComboboxState) => {
    // If the current search DOES NOT match the selected value, show 'add to vocab' button
    const { search, value } = state;
    const isMatch = search === value?.label;
    setAddTerm(isMatch ? undefined : search);
  }

  const onAddTerm = (term: string) => {
    model.addRelationshipType({ name: term });
    onChange({ value: term });
  }

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col">
      <Combobox
        autofocus={(props.annotation.bodies || []).length === 0}
        className="w-[196px] p-2"
        value={selected}
        options={options}
        onChange={onChange} 
        onStateChange={onComboboxStateChange}>
        {addTerm && (
          <div className="p-2 border-t bg-muted">
            <p className="p-1 pb-2 text-center text-xs text-muted-foreground">
              Add to vocabulary:
            </p>
            <Button 
              size="sm"
              className="w-full font-semibold text-xs"
              onClick={() => onAddTerm(addTerm)}>
              <CirclePlus className="h-4 w-4 mr-2" />{addTerm}
            </Button>
          </div>
        )}
      </Combobox>
    </div>
  )


}