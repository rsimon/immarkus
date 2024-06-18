import { useEffect, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { useGraphSearch } from './useGraphSearch';
import { Graph } from '../Types';
import { 
  Comparator, 
  ConditionType, 
  DropdownOption,
  ObjectType,
  Sentence, 
  SimpleConditionSentence 
} from './Types';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface GraphSearchConditionBuilderProps {

  graph: Graph;

  objectType: ObjectType;

  sentence: Partial<Sentence>;

  onChange(sentence: Partial<Sentence>, matches?: string[]): void;

  onDelete(): void;

}

export const GraphSearchConditionBuilder = (props: GraphSearchConditionBuilderProps) => {

  const {
    attributeOptions,
    comparatorOptions,
    matches,
    sentence,
    updateSentence,
    valueOptions
  } = useGraphSearch(props.graph, props.objectType, props.sentence);

  useEffect(() => {
    props.onChange(sentence, matches);
  }, [sentence, matches]);

  const conditionTypes = useMemo(() => props.objectType === 'IMAGE' ? [
    { label: 'where', value: 'WHERE' },
    { label: 'annotated with', value: 'ANNOTATED_WITH' }
  ] : [
    { label: 'where', value: 'WHERE' }
  ], [props.objectType]);

  const selectStyle = 
    'rounded-none min-w-32 max-w-40 px-2 py-1 h-auto bg-white shadow-none border-l-0 whitespace-nowrap overflow-hidden text-ellipsis';

  const renderDropdown = (value: string | undefined, options: DropdownOption[], onChange: ((value: string) => void)) => (
    <Select 
      value={value || ''}
      onValueChange={onChange}>
      <SelectTrigger className={selectStyle}>
        <span className="overflow-hidden text-ellipsis text-xs">
          <SelectValue />
        </span>
      </SelectTrigger>

      <SelectContent className="overflow-hidden max-h-60 overflow-y-auto">
        {options.map(option => (
          <SelectItem 
            key={option.value} 
            className="text-xs max-w-80 overflow-hidden whitespace-nowrap text-ellipsis"
            value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-nowrap">
      <Select 
        value={sentence.ConditionType || ''}
        onValueChange={t => updateSentence({ 
          ConditionType: t as ConditionType,
          Attribute: undefined,
          Comparator: undefined,
          Value: undefined          
        })}>

        <SelectTrigger className={`${selectStyle} border-l`}>
          <span className="overflow-hidden text-ellipsis text-xs">
            <SelectValue />
          </span>
        </SelectTrigger>

        <SelectContent className="max-h-96">
          {conditionTypes.map(option => (
            <SelectItem 
              key={option.value} 
              className="text-xs"
              value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {sentence.ConditionType && sentence.ConditionType !== 'ANNOTATED_WITH' && 
        renderDropdown(
          (sentence as SimpleConditionSentence).Attribute, 
          attributeOptions, 
          value => updateSentence({ 
            Attribute: value,
            Value: undefined 
        }))}

      {'Attribute' in sentence && sentence.Attribute && 
        renderDropdown(
          sentence.Comparator, 
          comparatorOptions, 
          value => updateSentence({ 
            Comparator: value as Comparator,
            Value: undefined 
          }))}

      {(
        ('Comparator' in sentence && sentence.Comparator === 'IS') ||
        (sentence.ConditionType === 'ANNOTATED_WITH')) && 

        renderDropdown(
          sentence.Value, 
          valueOptions, 
          value => updateSentence({ Value: value }))}

      <button className="border border-l-0 w-7 flex items-center justify-center text-muted-foreground">
        <Trash2 className="w-3.5 h-3.5" onClick={props.onDelete} />
      </button>
    </div>
  )

}