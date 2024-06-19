import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { W3CAnnotation } from '@annotorious/react';
import { Image } from '@/model';
import { useSubConditions } from './useSubConditions';
import { SubCondition } from './Types';
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

  const annotations = useMemo(() => (
    props.annotations.reduce<W3CAnnotation[]>((all, { image, annotations}) => ([...all, ...annotations]), [])
  ), props.annotations);

  const { properties, values } = 
    useSubConditions(annotations, props.subjectId, props.subcondition.Attribute);

  const selectStyle = 
    'rounded-none min-w-32 max-w-40 px-2 py-1 h-auto bg-white shadow-none whitespace-nowrap overflow-hidden text-ellipsis';

  const onChangeAttribute = (attribute: string) =>
    props.onChange({...props.subcondition, Attribute: attribute });

  const onChangeValue = (value: string) =>
    props.onChange(({...props.subcondition, Value: value }));
  
  return (
    <div className="flex pt-2">
      <div className="w-32 text-right px-2 py-1">where</div>

      <Select
        value={props.subcondition.Attribute}
        onValueChange={onChangeAttribute}>
        <SelectTrigger className={selectStyle}>
          <span className="overflow-hidden text-ellipsis text-xs">
            <SelectValue />
          </span>
        </SelectTrigger>

        <SelectContent className="max-h-96">
          {properties.map((definition, idx) => (
            <SelectItem 
              key={`${definition.name}-${idx}`}
              className="text-xs"
              value={definition.name}>{definition.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="px-2 py-1">is</div>

      <Select 
        disabled={values.length === 0}
        value={props.subcondition.Value || ''}
        onValueChange={onChangeValue}>
        <SelectTrigger className={selectStyle}>
          <span className="overflow-hidden text-ellipsis text-xs">
            <SelectValue />
          </span>
        </SelectTrigger>

        <SelectContent className="max-h-96">
          {values.map(value => (
            <SelectItem 
              key={value}
              className="text-xs"
              value={value}>{value}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button className="border border-l-0 w-7 flex items-center justify-center text-muted-foreground">
        <Trash2 className="w-3.5 h-3.5" onClick={props.onDelete} />
      </button>
    </div>
  )

}