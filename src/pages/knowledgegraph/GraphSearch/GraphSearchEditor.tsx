import { useGraphSearch } from './useGraphSearch';
import { Comparator, DropdownOption } from './Types';

interface GraphSearchEditorProps {

}

const ObjectTypes = [
  { label: 'Folder', value: 'FOLDER' }, 
  { label: 'Image', value: 'IMAGE'}
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
    updateSentence
  } = useGraphSearch();

  const renderDropdown = <T, >(options: DropdownOption<T>[], onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void) => (
    <select onChange={onChange}>
      {options.map((option, index) => (
        <option key={option.label} value={index.toString()}>
          {option.label}
        </option>
      ))}
    </select>
  );

  return (
    <div className="absolute top-4 left-4 bg-red-300 z-50 p-5">
      <select 
        onChange={(e) => updateSentence({ ObjectType: e.target.value as 'FOLDER' | 'IMAGE' })}>
        {ObjectTypes.map(({ label, value }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      {sentence.ObjectType && (
        <select 
          onChange={(e) => updateSentence({ ConditionType: e.target.value as 'WHERE' | 'IN_FOLDERS_WHERE' | 'ANNOTATED_WITH' })}>
          {ConditionTypes.map(({ label, value }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      )}

      {sentence.ConditionType && sentence.ConditionType !== 'ANNOTATED_WITH' && 
        renderDropdown(attributeOptions, (e) => updateSentence({ Attribute: e.target.value }))}

      {'Attribute' in sentence && sentence.Attribute && 
        renderDropdown(comparatorOptions, (e) => updateSentence({ Comparator: e.target.value as Comparator }))}
    </div>
  )

}