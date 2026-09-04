import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, PanelsTopLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { W3CAnnotation } from '@annotorious/react';
import { useOpenInAnnotationView } from '@/pages/annotate';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { Graph, GraphNode } from '../../Types';
import { useFulltextSearch } from './useFulltextSearch';

interface FulltextSearchProps {

  annotations: { sourceId: string, annotations: W3CAnnotation[] }[];

  graph: Graph;

  query?:((n: GraphNode) => boolean);
  
  onChangeQuery(query?: ((n: GraphNode) => boolean)): void;

  onGoToBuilder(): void;

}

export const FulltextSearch = (props: FulltextSearchProps) => {

  const { t } = useTranslation('knowledgegraph');

  const { search } = useFulltextSearch(props.annotations, props.graph);

  const [query, setQuery] = useState('');

  const { openInAnnotationView } = useOpenInAnnotationView();

  const matchedImages = useMemo(() => {
    if (!props.query) return [];

    return props.graph.nodes
      .filter(n => props.query!(n))
      .map(m => m.id);
  }, [props.query, props.graph]);

  useEffect(() => {
    const hits = new Set(search(query).map(h => h.nodeId));
    const q = (n: GraphNode) => hits.has(n.id);
    props.onChangeQuery(q);
  }, [search, query, props.onChangeQuery]);

  return (
    <div className="px-4 py-4">
      <Input 
        autoComplete="off"
        value={query}
        placeholder={t('graphSearch.searchAnnotationsAndMetadata')} 
        onChange={e => setQuery(e.target.value)} />

      <div className="mt-1 flex justify-between items-center">
        {props.query ? (
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  disabled={matchedImages.length === 0}
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-xs font-normal px-1.5 -mx-0.5 disabled:text-muted-foreground/70 disabled:hover:bg-transparent"
                  onClick={() => openInAnnotationView(matchedImages)}>
                  <PanelsTopLeft className="size-3.5" /> {matchedImages.length} 
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                {t('graphSearch.openInWorkspace')}
              </TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div />
        )}
        
        <button 
          className="flex items-center text-[11.5px] text-muted-foreground gap-0.5 mr-0.5 hover:underline hover:text-black "
          onClick={props.onGoToBuilder}>
          <ChevronRight className="h-3 w-3" /> {t('graphSearch.useQueryBuilder')}
        </button>
      </div>
    </div>
  )
  
}