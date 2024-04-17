import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useConditionBuilderState } from './useConditionBuilderState';
import { Predicate } from './Types';
import { GraphNode } from '../Types';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface QueryConditionBuilderProps {

  isFirstCondition?: boolean;

  typeFilter?: GraphNode['type'];

  onChangeQuery(query?: ((n: GraphNode) => boolean)): void;

  onDelete(): void;

}

export const QueryConditionBuilder = (props: QueryConditionBuilderProps) => {

  const { typeFilter } = props;

  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();

  const { subjectOptions, objectOptions } = useConditionBuilderState({
    typeFilter, selectedSubject
  });

  useEffect(() => {
    if (subjectOptions.length > 0)
      setSelectedSubject(subjectOptions[0].value);
  }, [subjectOptions]);

  const [selectedPredicate, setSelectedPredicate] = useState<Predicate>('IS_NOT_EMPTY');

  const [selectedObject, setSelectedObject] = useState<string | undefined>();

  useEffect(() => {
    if (objectOptions.length > 0)
      setSelectedObject(objectOptions[0].value);
  }, [objectOptions]);

  useEffect(() => {
    const query = 
      selectedPredicate === 'IS_NOT_EMPTY' ?
        (n: GraphNode) => (n.properties || {})[selectedSubject] !== undefined :
      selectedPredicate === 'IS' ?
        (n: GraphNode) => (n.properties || {})[selectedSubject] === selectedObject :
      (_: GraphNode) => true;

    props.onChangeQuery(query);
  }, [selectedSubject, selectedPredicate, selectedObject]);

  const selectStyle = 
    'rounded-none min-w-32 max-w-40 px-2 py-1 h-auto bg-white shadow-none border-l-0 whitespace-nowrap overflow-hidden text-ellipsis';

  return (
    <div className="text-xs flex items-center gap-2 pt-2">
      {props.isFirstCondition ? (
        <span className="w-12 text-right">where</span>
      ) : (
        <div className="w-16 text-right"></div>
      )}

      <div className="flex flex-nowrap">
        <Select 
          value={selectedSubject}
          onValueChange={setSelectedSubject}>
          <SelectTrigger className={`${selectStyle} border-l`}>
            <span className="overflow-hidden text-ellipsis text-xs">
              <SelectValue />
            </span>
          </SelectTrigger>

          <SelectContent className="max-h-96">
            {subjectOptions.map(option => (
              <SelectItem 
                key={option.value} 
                className="text-xs"
                value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select 
          value={selectedPredicate}
          onValueChange={value => setSelectedPredicate(value as Predicate)}>
          <SelectTrigger className={selectStyle}>
            <span className="overflow-hidden text-ellipsis text-xs">
              <SelectValue />
            </span>
          </SelectTrigger>

          <SelectContent className="max-h-96">
            <SelectItem className="text-xs" value="IS">is</SelectItem>
            <SelectItem className="text-xs" value="IS_NOT_EMPTY">is not empty</SelectItem>
          </SelectContent>
        </Select>

        {selectedPredicate === 'IS_NOT_EMPTY' ? (
          <div className={`border ${selectStyle}`} />
        ) : (
          <Select
            value={selectedObject}
            onValueChange={setSelectedObject}>
            <SelectTrigger className={selectStyle}>
              <span className="overflow-hidden text-ellipsis text-xs">
                <SelectValue />
              </span>
            </SelectTrigger>

            <SelectContent className="max-h-96">
              {objectOptions.map(option => (
                <SelectItem 
                  key={option.value} 
                  className="text-xs"
                  value={option.value}>{option.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <button className="border border-l-0 w-7 flex items-center justify-center text-muted-foreground">
          <Trash2 className="w-3.5 h-3.5" onClick={props.onDelete} />
        </button>
      </div>
    </div>
  )


}