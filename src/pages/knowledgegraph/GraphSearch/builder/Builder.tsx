import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { W3CAnnotation } from '@annotorious/react';
import { CirclePlus, PanelsTopLeft, TextCursorInput, Trash2, X } from 'lucide-react';
import { useOpenInAnnotationView } from '@/pages/annotate/AnnotationViewState';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { useSearchState } from '../../KnowledgeGraphState';
import { GraphSearchConditionBuilder } from './GraphSearchConditionBuilder';
import { ExportSelector } from '../export';
import { 
  Condition, 
  Graph, 
  GraphNode, 
  GraphNodeType, 
  KnowledgeGraphSettings,
  NestedConditionSentence,
  Operator, 
  Sentence
} from '../../Types';
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from '@/ui/Select';

interface BuilderProps {

  annotations: { sourceId: string, annotations: W3CAnnotation[] }[];

  graph: Graph;

  isFullscreen: boolean;

  query?:((n: GraphNode) => boolean);

  settings: KnowledgeGraphSettings;

  onChangeQuery(query?: ((n: GraphNode) => boolean)): void;

  onGoToFulltextSearch(): void;

}

const EMPTY_CONDITION: Condition = { operator: 'AND', sentence: {} };

export const Builder = (props: BuilderProps) => {

  const { t } = useTranslation('knowledgegraph');

  const { objectType, setObjectType, conditions, setConditions } = useSearchState();

  const { openInAnnotationView } = useOpenInAnnotationView();

  const matchedImages = useMemo(() => {
    if (objectType !== 'IMAGE' || !props.query) return [];
    
    return props.graph.nodes
      .filter(n => props.query!(n))
      .map(m => m.id);
  }, [props.query, props.graph, objectType]);

  useEffect(() => {
    if (conditions.length === 0) {
      // No conditions - remove query
      props.onChangeQuery(undefined)
    } else {
      // Remove the last condition if it is unfinished
      const toApply = conditions[conditions.length - 1].matches ?
        conditions : conditions.slice(0, -1);

      // For now, we'll treat the condition list step by step, where
      // all conditions BEFORE the current are treated as if they were one
      // result. E.g: 
      //
      //  'A' and 'B' and 'C' or 'D'
      //
      //  would be logically treated as...
      // 
      //  ((('A' and 'B') and 'C') or 'D')
      const matches = new Set(toApply.reduce<string[]>((previousMatches, condition) => {
        if (condition.operator === 'AND') {
          // Next result is the intersection of the previous with this result
          return previousMatches.filter(str => (condition.matches || []).includes(str));
        } else {
          // Next result is the union of the previous with this result
          return [...new Set([...previousMatches, ...(condition.matches || [])])];
        }        
      }, conditions[0].matches!));

      const query = (n: GraphNode) =>
        n.type === objectType && matches.has(n.id);

      props.onChangeQuery(query);
    }
  }, [conditions]);

  const isComplete = (sentence: Partial<Sentence>) => {
    if (!sentence.ConditionType) return false;

    if ('Attribute' in sentence && sentence.Attribute) {
      // SimpleConditionSentence
      return Boolean(sentence.Comparator);
    } else if ('data' in sentence) {
      return Boolean(sentence.data);
    } else {
      // NestedConditionSentence
      return Boolean((sentence as NestedConditionSentence).Value);
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
    setObjectType(value as GraphNodeType);

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

  return (
    <div className="pl-1 pr-5 pb-2 pt-4">
      <div className="text-xs flex items-center gap-2">
        <span className="w-14 text-right">
          {t('graphSearch.find')}
        </span>
        
        <Select 
          value={objectType || ''}
          onValueChange={onSelectObjectType}>
          <SelectTrigger className="rounded-none px-2 py-1 h-auto bg-white shadow-none">
            <span className="text-xs">
              <SelectValue placeholder={t('graphSearch.selectNodeType')} />
            </span>
          </SelectTrigger>

          <SelectContent>
            {props.settings.graphMode === 'RELATIONS' && (
              <SelectItem
                className="text-xs" 
                value="ENTITY_TYPE">{t('graphSearch.objectTypes.entityClasses')}</SelectItem>
            )}

            {props.settings.includeFolders && (
              <SelectItem
                className="text-xs" 
                value="FOLDER">{t('graphSearch.objectTypes.subFolders')}</SelectItem>
            )}

            <SelectItem
              className="text-xs" 
              value="IMAGE">{t('graphSearch.objectTypes.images')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {conditions.map(({ operator, sentence }, idx) => (
        <div 
          className="flex flex-nowrap gap-2 pt-2 text-xs items-start"
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
                    value="AND">{t('graphSearch.operators.and')}</SelectItem>

                  <SelectItem
                    className="text-xs"
                    value="OR">{t('graphSearch.operators.or')}</SelectItem>
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
        <div className="flex justify-between pt-4 pl-14 gap-10">
          <div className="flex items-center gap-4">
            <Button 
              disabled={!conditions.map(c => c.sentence).every(isComplete)}
              variant="link"
              size="sm"
              className="flex items-center text-xs py-0 px-0 font-normal"
              onClick={() => setConditions(conditions => ([...conditions, {...EMPTY_CONDITION}]))}>
              <CirclePlus className="size-3.5 ml-0.5 mr-1 mb-0.5" /> {t('graphSearch.addCondition')}
            </Button>

            <Button 
              variant="link"
              size="sm"
              className="flex items-center text-xs py-0 px-0 font-normal"
              onClick={onClearAll}>
              <Trash2 className="size-3.5 mr-1 mb-px" /> {t('graphSearch.clear')}
            </Button>

            <Button 
              variant="link"
              size="sm"
              className="flex items-center text-xs py-0 px-0 font-normal"
              onClick={props.onGoToFulltextSearch}>
              <TextCursorInput className="size-4 mr-1 mb-px" /> {t('graphSearch.simpleSearch')}
            </Button>
          </div>

          {props.query && (
            <div className="flex items-center gap-2">
              <ExportSelector 
                objectType={objectType}
                graph={props.graph} 
                query={props.query} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    disabled={matchedImages.length === 0}
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs font-normal px-1.5"
                    onClick={() => openInAnnotationView(matchedImages)}>
                    {matchedImages.length} <PanelsTopLeft className="size-3.5" />
                  </Button>
                </TooltipTrigger>

                <TooltipContent>
                  {t('graphSearch.openInWorkspace')}
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      ) : (
        <div className="px-2 pt-8">
          <Button 
            variant="link"
            size="sm"
            className="h-auto text-xs p-0 font-normal"
            onClick={props.onGoToFulltextSearch}>
            {t('graphSearch.simpleSearch')}
          </Button>
        </div>
      )}
    </div>
  )

}