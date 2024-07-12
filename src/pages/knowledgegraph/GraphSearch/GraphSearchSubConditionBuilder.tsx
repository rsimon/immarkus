import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { W3CAnnotation } from '@annotorious/react';
import { Combobox } from '@/components/Combobox';
import { Image } from '@/model';
import { useSubConditions } from './useSubConditions';
import { DropdownOption, SubCondition } from './Types';

interface GraphSearchSubConditionBuilderProps {

  annotations: { image: Image, annotations: W3CAnnotation[] }[];

  subjectId: string;

  subcondition: Partial<SubCondition>;

  onChange(subcondition: Partial<SubCondition>): void;

  onDelete(): void;

}

export const GraphSearchSubConditionBuilder = (props: GraphSearchSubConditionBuilderProps) => {

  const annotations = useMemo(() => (
    props.annotations.reduce<W3CAnnotation[]>((all, { image, annotations}) => ([...all, ...annotations]), [])
  ), props.annotations);

  const { properties, values } = 
    useSubConditions(annotations, props.subjectId, props.subcondition.Attribute);

  const selectStyle = 
    'rounded-none min-w-32 max-w-40 px-2 py-1 h-auto min-h-[30px] bg-white shadow-none whitespace-nowrap overflow-hidden text-ellipsis';

  const onChangeAttribute = (attribute: DropdownOption) =>
    props.onChange({...props.subcondition, Attribute: attribute });

  const onChangeValue = (value: DropdownOption) =>
    props.onChange(({...props.subcondition, Value: value }));
  
  return (
    <div className="flex pt-2">
      <div className="w-32 text-right px-2 py-1">where</div>

      <Combobox 
        className={selectStyle}
        value={props.subcondition.Attribute}
        options={properties.map(p => ({ label: p.name, value: p.name }))} 
        onChange={onChangeAttribute} />

      <div className="px-2 py-1">is</div>

      <Combobox 
        className={selectStyle}
        value={props.subcondition.Value}
        options={values.map(value => ({ label: value, value }))} 
        onChange={onChangeValue} />

      <button className="border border-l-0 w-7 flex items-center justify-center text-muted-foreground">
        <Trash2 className="w-3.5 h-3.5" onClick={props.onDelete} />
      </button>
    </div>
  )

}