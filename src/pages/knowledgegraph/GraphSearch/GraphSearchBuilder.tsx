import { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import { Grip, Plus, X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { GraphSearchConditionBuilder } from './GraphSearchConditionBuilder';
import { ObjectType, Sentence } from './Types';
import { KnowledgeGraphSettings } from '../Types';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface GraphSearchBuilderProps {

  settings: KnowledgeGraphSettings;

  onClose(): void;

}

export const GraphSearchBuilder = (props: GraphSearchBuilderProps) => {

  const el = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [objectType, setObjectType] = useState<ObjectType | undefined>();

  const [conditions, setConditions] = useState<Partial<Sentence>[]>([]);

  useDraggable(el, {
    position,
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
  });

  useEffect(() => {
    if (objectType)
      setConditions([{}]);
    else 
      setConditions([]);
  }, [objectType]);

  useEffect(() => {
    console.log('conditions', conditions);
  }, [conditions]);

  const isComplete = (sentence: Partial<Sentence>) => {
    if (!sentence.ConditionType || !sentence.Value) return false;

    if ('Attribute' in sentence) {
      // SimpleConditionSentence
      return sentence.Attribute && sentence.Comparator;
    } else {
      // NestedConditionSentence
      return false; // TODO
    }
  }

  const onDelete = (sentence: Partial<Sentence>) => {
    const next = conditions.filter(c => c !== sentence);

    setConditions(next);

    if (next.length === 0)
      setObjectType(undefined);
  }

  return (
    <div 
      ref={el}
      className="bg-white min-w-[510px] min-h-[180px] backdrop-blur-sm border absolute top-6 left-6 rounded shadow-lg z-30">
    
      <div className="flex justify-between items-center pl-2 pr-1 py-1 border-b cursor-move mb-4 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Grip className="w-4 h-4 mb-0.5" />
          <span>Graph Search</span>
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="p-0 h-auto w-auto"
          onClick={props.onClose}>
          <X className="h-8 w-8 p-2" />
        </Button>
      </div>

      <div className="p-2 pr-6 pb-8">
        <div className="text-xs flex items-center gap-2">
          <span className="w-12 text-right">
            Find
          </span> 
          
          <Select 
            value={objectType || ''}
            onValueChange={value => setObjectType(value as ObjectType)}>
            
            <SelectTrigger className="rounded-none px-2 py-1 h-auto bg-white shadow-none">
              <span className="text-xs">
                <SelectValue placeholder="select node type..." />
              </span>
            </SelectTrigger>

            <SelectContent>
              <SelectItem 
                disabled={!props.settings.includeFolders}
                className="text-xs" 
                value="FOLDER">sub-folders</SelectItem>

              <SelectItem
                className="text-xs" 
                value="IMAGE">images</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {conditions.map((sentence, idx) => (
          <div 
            className="flex flex-nowrap gap-2 pt-2 text-xs items-center"
            key={idx}>
            
            {(idx === 0) ? (
              <div className="w-12" />
            ) : (
              <div className="w-12 text-right">and</div>
            )}

            <GraphSearchConditionBuilder 
              sentence={sentence}
              onChange={s => setConditions(c => c.map(current => current === sentence ? s : current))}
              onDelete={() => onDelete(sentence)} />
          </div>
        ))}

        {(conditions.length > 0 && isComplete(conditions[conditions.length - 1])) && (
          <div className="flex justify-start pt-2 pl-14 pr-2">
            <Button 
              disabled={!conditions.every(isComplete)}
              variant="link"
              size="sm"
              className="flex items-center text-xs py-0 px-0"
              onClick={() => setConditions(conditions => ([...conditions, {}]))}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Condition
            </Button>
          </div>
        )}
      </div>
    </div>
  )

}