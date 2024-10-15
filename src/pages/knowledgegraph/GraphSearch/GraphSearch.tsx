import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { W3CAnnotation } from '@annotorious/react';
import { useDraggable } from '@neodrag/react';
import { CirclePlus, Grip, Trash2, X } from 'lucide-react';
import { Image } from '@/model';
import { Button } from '@/ui/Button';
import { ExportSelector } from './export';
import { GraphSearchConditionBuilder } from './GraphSearchConditionBuilder';
import { useSearchDialogPos, useSearchState } from '../KnowledgeGraphState';
import { 
  Condition, 
  Graph, 
  GraphNode, 
  KnowledgeGraphSettings,
  ObjectType, 
  Operator, 
  Sentence
} from '../Types';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface GraphSearchProps {

  annotations: { image: Image, annotations: W3CAnnotation[] }[];

  graph: Graph;

  isFullscreen: boolean;

  query?:((n: GraphNode) => boolean);

  settings: KnowledgeGraphSettings;

  onChangeQuery(query?: ((n: GraphNode) => boolean)): void;

  onClose(): void;

}

const EMPTY_CONDITION: Condition = { operator: 'AND', sentence: {} };

export const GraphSearch = (props: GraphSearchProps) => {

  const el = useRef(null);

  const { position, setPosition } = useSearchDialogPos({ x: props.isFullscreen ? 0 : 250, y: 0 });

  const { objectType, setObjectType, conditions, setConditions } = useSearchState();

  useDraggable(el, {
    position,
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY }),
  });

  useEffect(() => {
    if (conditions.length === 0) {
      // No conditions - remove query
      props.onChangeQuery(undefined)
    } else {
      // Remove the last condition if it is unfinished
      const toApply = conditions[conditions.length - 1].matches ?
        conditions : conditions.slice(0, -1);

      // For now, we keep all conditions AND-connected, which means
      // the total matches are the intersection of all individual matches
      const intersection = new Set(toApply.reduce((intersected, { matches }) => {
        return intersected.filter(str => (matches || []).includes(str));
      }, conditions[0].matches!));

      const query = (n: GraphNode) =>
        n.type === objectType && intersection.has(n.id);

      props.onChangeQuery(query);
    }
  }, [conditions]);

  const isComplete = (sentence: Partial<Sentence>) => {
    if (!sentence.ConditionType) return false;

    if ('Attribute' in sentence && sentence.Attribute) {
      // SimpleConditionSentence
      return Boolean(sentence.Comparator);
    } else {
      // NestedConditionSentence
      return Boolean(sentence.Value);
    }
  }
  
  const onChange = (current: Partial<Sentence>, next: Partial<Sentence>, matches?: string[]) => {
    const updated = conditions.map(condition => 
        condition.sentence === current ? ({ operator: condition.operator, sentence : next, matches }) : condition);

    setConditions(updated);
  }

  const onDelete = (sentence: Partial<Sentence>) => {
    const next = conditions.filter(c => c.sentence !== sentence);

    setConditions(next);

    if (next.length === 0)
      setObjectType(undefined);
  }

  const onSelectObjectType = (value: string) => {
    setObjectType(value as ObjectType);

    if (value) {
      setConditions([{...EMPTY_CONDITION}]);
    } else {
      setConditions([]);
    }
  }

  const onSelectOperator = (sentence: Partial<Sentence>, operator: Operator) => {
    const next = conditions.map(c => c.sentence === sentence ? ({...c, operator }) : c);
    setConditions(next);
  }

  const onClearAll = () => {
    setObjectType(undefined);
    setConditions([]);
  }

  return createPortal(
    <div 
      ref={el}
      className="bg-white min-w-[510px] min-h-[80px] backdrop-blur-sm border absolute top-6 left-6 rounded shadow-lg z-30">
    
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

      <div className="px-3 pr-6 pb-2">
        <div className="text-xs flex items-center gap-2">
          <span className="w-14 text-right">
            Find
          </span>
          
          <Select 
            value={objectType || ''}
            onValueChange={onSelectObjectType}>
            <SelectTrigger className="rounded-none px-2 py-1 h-auto bg-white shadow-none">
              <span className="text-xs">
                <SelectValue placeholder="select node type..." />
              </span>
            </SelectTrigger>

            <SelectContent>
              {props.settings.graphMode === 'RELATIONS' && (
                <SelectItem
                  className="text-xs" 
                  value="ENTITY_TYPE">entity classes</SelectItem>
              )}

              {props.settings.includeFolders && (
                <SelectItem
                  className="text-xs" 
                  value="FOLDER">sub-folders</SelectItem>
              )}

              <SelectItem
                className="text-xs" 
                value="IMAGE">images</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {conditions.map(({ operator, sentence }, idx) => (
          <div 
            className="flex flex-nowrap gap-2 pt-2 text-xs items-center"
            key={idx}>
            
            {(idx === 0) ? (
              <div className="w-14" />
            ) : (
              <div className="w-14">
                <Select 
                  value={operator || 'AND'}
                  onValueChange={op => onSelectOperator(sentence, op as Operator)}>
                  <SelectTrigger className="w-16 rounded-none border-r-0 px-2 py-1 h-auto bg-white shadow-none">
                    <span className="text-xs">
                      <SelectValue />
                    </span>
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem
                      className="text-xs" 
                      value="AND">and</SelectItem>

                    <SelectItem
                      className="text-xs" 
                      value="OR">or</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <GraphSearchConditionBuilder 
              annotations={props.annotations}
              graph={props.graph}
              objectType={objectType}
              sentence={sentence}
              settings={props.settings}
              onChange={(next, matches) => onChange(sentence, next, matches)}
              onDelete={() => onDelete(sentence)} />
          </div>
        ))}

        {(conditions.length > 0 && isComplete(conditions[conditions.length - 1].sentence)) ? (
          <div className="flex justify-between pt-4 pl-14">
            <div className="flex items-center gap-4">
              <Button 
                disabled={!conditions.map(c => c.sentence).every(isComplete)}
                variant="link"
                size="sm"
                className="flex items-center text-xs py-0 px-0 font-normal"
                onClick={() => setConditions(conditions => ([...conditions, {...EMPTY_CONDITION}]))}>
                <CirclePlus className="h-3.5 w-3.5 ml-0.5 mr-1 mb-[2px]" /> Add Condition
              </Button>

              <Button 
                variant="link"
                size="sm"
                className="flex items-center text-xs py-0 px-0 font-normal"
                onClick={onClearAll}>
                <Trash2 className="h-3.5 w-3.5 mr-1 mb-[1px]" /> Clear All
              </Button>
            </div>

            {props.query && (
              <ExportSelector 
                graph={props.graph} 
                query={props.query} />
            )}
          </div>
        ) : (
          <div className="h-4"/>
        )}
      </div>
    </div>, document.body
  )

}