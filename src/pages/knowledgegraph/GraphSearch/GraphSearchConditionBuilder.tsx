import { useGraphSearch } from './useGraphSearch';
import { Comparator, DropdownOption, ObjectType, Sentence, SimpleConditionSentence } from './Types';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';

interface GraphSearchConditionBuilderProps {

  sentence: Partial<Sentence>;

  onChange(sentence: Partial<Sentence>): void;

  onDelete(): void;

}

const ConditionTypes = [
  { label: 'where', value: 'WHERE' },
  { label: 'in folders where', value: 'IN_FOLDERS_WHERE' },
  { label: 'annotated with', value: 'ANNOTATED_WITH' }
];

export const GraphSearchConditionBuilder = (props: GraphSearchConditionBuilderProps) => {

  const {
    attributeOptions,
    comparatorOptions,
    sentence,
    updateSentence,
    valueOptions
  } = useGraphSearch(props.sentence);

  useEffect(() => {
    if (sentence !== props.sentence)
      props.onChange(sentence);
  }, [sentence]);

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

      <SelectContent className="max-h-96">
        {options.map(option => (
          <SelectItem 
            key={option.value} 
            className="text-xs"
            value={option.value}>{option.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-nowrap">
      <Select 
        value={sentence.ConditionType || ''}
        onValueChange={t => updateSentence({ 
          ConditionType: t as 'WHERE' | 'IN_FOLDERS_WHERE' | 'ANNOTATED_WITH',
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
          {ConditionTypes.map(option => (
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

      {'Comparator' in sentence && sentence.Comparator && 
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