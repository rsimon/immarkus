import { useGraphSearch } from './useGraphSearch';
import { Comparator, DropdownOption, SimpleConditionSentence } from './Types';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface GraphSearchEditorProps {

}

const ObjectTypes = [
  { label: 'Folders', value: 'FOLDER' }, 
  { label: 'Images', value: 'IMAGE'}
];

const ConditionTypes = [
  { label: 'where', value: 'WHERE' },
  { label: 'in folders where', value: 'IN_FOLDERS_WHERE' },
  { label: 'annotated with', value: 'ANNOTATED_WITH' }
];

export const GraphSearchEditor = (props: GraphSearchEditorProps) => {

  const {
    attributeOptions,
    comparatorOptions,
    sentence,
    updateSentence,
    valueOptions
  } = useGraphSearch();

  const renderDropdown = (value: string | undefined, options: DropdownOption[], onChange: ((value: string) => void)) => (
    <Select 
      value={value}
      onValueChange={onChange}>
      <SelectTrigger className={`${selectStyle} border-l`}>
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

  const selectStyle = 
    'rounded-none min-w-32 max-w-40 px-2 py-1 h-auto bg-white shadow-none border-l-0 whitespace-nowrap overflow-hidden text-ellipsis';

  return (
    <div className="absolute top-4 left-4 bg-red-300 z-50 p-5">
      <Select 
        value={sentence.ObjectType}
        onValueChange={t => updateSentence({ ObjectType: t as 'FOLDER' | 'IMAGE' })}>
        <SelectTrigger className={`${selectStyle} border-l`}>
          <span className="overflow-hidden text-ellipsis text-xs">
            <SelectValue />
          </span>
        </SelectTrigger>

        <SelectContent className="max-h-96">
          {ObjectTypes.map(option => (
            <SelectItem 
              key={option.value} 
              className="text-xs"
              value={option.value}>{option.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {sentence.ObjectType && (
        <Select 
          value={sentence.ConditionType}
          onValueChange={t => updateSentence({ ConditionType: t as 'WHERE' | 'IN_FOLDERS_WHERE' | 'ANNOTATED_WITH' })}>
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
      )}

      {sentence.ConditionType && sentence.ConditionType !== 'ANNOTATED_WITH' && 
        renderDropdown((sentence as SimpleConditionSentence).Attribute, attributeOptions, value => updateSentence({ Attribute: value }))}

      {'Attribute' in sentence && sentence.Attribute && 
        renderDropdown(sentence.Comparator, comparatorOptions, value => updateSentence({ Comparator: value as Comparator }))}

      {'Comparator' in sentence && sentence.Comparator && 
        renderDropdown(sentence.Value, valueOptions, value => updateSentence({ Value: value }))}
    </div>
  )

}