import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { W3CAnnotation } from '@annotorious/react';
import { Combobox } from '@/components/Combobox';
import { Image } from '@/model';
import { useSubConditions } from './useSubConditions';
import { Comparator, DropdownOption, SubCondition } from '../Types';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface GraphSearchSubConditionBuilderProps {

  annotations: { image: Image, annotations: W3CAnnotation[] }[];

  subjectId: string;

  subcondition: Partial<SubCondition>;

  onChange(subcondition: Partial<SubCondition>): void;

  onDelete(): void;

}

export const GraphSearchSubConditionBuilder = (props: GraphSearchSubConditionBuilderProps) => {

  const { subcondition } = props;

  const annotations = useMemo(() => (
    props.annotations.reduce<W3CAnnotation[]>((all, { image, annotations}) => ([...all, ...annotations]), [])
  ), props.annotations);

  const { comparatorOptions, properties, values,  } = 
    useSubConditions(annotations, props.subjectId, subcondition.Attribute);

  const selectStyle = 
    'rounded-none min-w-32 max-w-40 px-2 py-1 h-auto min-h-[30px] bg-white border-l-0 shadow-none whitespace-nowrap overflow-hidden text-ellipsis';

  const onChangeAttribute = (attribute: DropdownOption) =>
    props.onChange({...subcondition, Attribute: attribute });

  const onChangeComparator = (comp: Comparator) =>
    props.onChange({...subcondition, Comparator: comp });

  const onChangeValue = (value: DropdownOption) =>
    props.onChange(({...subcondition, Value: value }));
  
  return (
    <div className="flex pt-2">
      <div className="w-32 text-right px-2 py-1">where</div>

      <Combobox 
        className={`${selectStyle} border-l`}
        value={subcondition.Attribute}
        options={properties.map(p => ({ label: p.name, value: p.name }))} 
        onChange={onChangeAttribute} />

      <Select 
        value={subcondition.Comparator || ''}
        onValueChange={onChangeComparator}>
        <SelectTrigger className={selectStyle}>
          <span className="overflow-hidden text-ellipsis text-xs">
            <SelectValue />
          </span>
        </SelectTrigger>

        <SelectContent className="overflow-hidden max-h-60 overflow-y-auto">
          {comparatorOptions.map(option => (
            <SelectItem 
              key={option.value} 
              className="text-xs max-w-80 overflow-hidden whitespace-nowrap text-ellipsis"
              value={option.value}>
              {option.label}
            </SelectItem>
          ))}

          {(comparatorOptions.length === 0) && (
            <div className="text-xs text-muted-foreground flex justify-center py-1">No matches</div>
          )}
        </SelectContent>
      </Select>

      {!(subcondition.Comparator === 'IS_NOT_EMPTY') && (
        <Combobox 
          className={selectStyle}
          value={subcondition.Value}
          options={values.map(value => ({ label: value, value }))} 
          onChange={onChangeValue} />
      )}

      <button className="border border-l-0 w-7 flex items-center justify-center text-muted-foreground">
        <Trash2 className="w-3.5 h-3.5" onClick={props.onDelete} />
      </button>
    </div>
  )

}