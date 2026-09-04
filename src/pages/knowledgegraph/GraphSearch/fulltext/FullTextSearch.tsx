import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, PanelsTopLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { W3CAnnotation } from '@annotorious/react';
import { Spinner } from '@/components/Spinner';
import { useOpenInAnnotationView } from '@/pages/annotate';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { cn } from '@/ui/utils';
import { Graph, GraphNode, KnowledgeGraphSettings } from '../../Types';
import { NODE_COLORS } from '../../Styles';
import { useFulltextSearch } from './useFulltextSearch';

interface FulltextSearchProps {

  annotations: { sourceId: string, annotations: W3CAnnotation[] }[];

  graph: Graph;

  query?:((n: GraphNode) => boolean);

  settings: KnowledgeGraphSettings;
  
  onChangeQuery(query?: ((n: GraphNode) => boolean)): void;

  onGoToBuilder(): void;

}

interface ResultCounts {

  folders: number;

  images: number;

}

export const FulltextSearch = (props: FulltextSearchProps) => {

  const { t } = useTranslation('knowledgegraph');

  const { search, initializing } = useFulltextSearch(props.annotations, props.graph);

  const [query, setQuery] = useState('');

  const { openInAnnotationView } = useOpenInAnnotationView();

  const matchedImages = useMemo(() => {
    if (!props.query) return [];

    return props.graph.nodes
      .filter(n => n.type === 'IMAGE' && props.query!(n))
      .map(m => m.id);
  }, [props.query, props.graph]);

  const matchedFolders = useMemo(() => {
    if (!props.query) return [];

    return props.graph.nodes
      .filter(n => n.type === 'FOLDER' && props.query!(n))
      .map(m => m.id);
  }, [props.query, props.graph]);

  useEffect(() => {
    const result = search(query);
    const hits = new Set(result.hits.map(h => h.nodeId));

    const q = (n: GraphNode) => hits.has(n.id);

    props.onChangeQuery(q);
  }, [search, query, props.onChangeQuery]);

  return initializing ? (
    <div className="px-2 py-9 flex items-center justify-center">
      <Spinner className="size-4 text-muted-foreground" />
    </div>
  ) : (
    <div className="px-4 py-4">
      <Input 
        autoComplete="off"
        value={query}
        placeholder={t('graphSearch.searchAnnotationsAndMetadata')} 
        onChange={e => setQuery(e.target.value)} />

      <div className="mt-1 ml-0.5 flex justify-between items-center">
        {props.query ? (
          <div className="flex items-center gap-3.5">
            {props.settings.includeFolders && (
              <div className={cn(
                'text-xs font-normal flex gap-1.5 items-center',
                matchedFolders.length === 0 && 'text-muted-foreground/70 opacity-50'
              )}>
                <span 
                  style={{ backgroundColor: matchedFolders.length > 0 ? NODE_COLORS['FOLDER'] : undefined }} 
                  className="bg-muted-foreground/50 block size-2 rounded-full mb-px" />
                {matchedFolders.length} Folders
              </div>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  disabled={matchedImages.length === 0}
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs font-normal gap-1 px-1.5 -mx-0.5 disabled:text-muted-foreground/70 disabled:hover:bg-transparent"
                  onClick={() => openInAnnotationView(matchedImages)}>

                  {props.settings.includeFolders ? (
                    <>
                      <span 
                        style={{ 
                          backgroundColor: matchedImages.length > 0 ? NODE_COLORS['IMAGE'] : undefined
                        }} 
                        className="bg-muted-foreground/50 block size-2 rounded-full mr-0.5 mb-px" />
                      {matchedImages.length} Images
                      <PanelsTopLeft className="size-3.5" />
                    </>
                  ) : (
                    <>                      
                      <PanelsTopLeft className="size-3.5" />
                      {matchedImages.length}
                    </>
                  )}
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