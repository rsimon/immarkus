import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { W3CAnnotation } from '@annotorious/react';
import { Input } from '@/ui/Input';
import { GraphNode } from '../../Types';
import { useFulltextSearch } from './useFulltextSearch';

interface FulltextSearchProps {

  annotations: { sourceId: string, annotations: W3CAnnotation[] }[];
  
  onChangeQuery(query?: ((n: GraphNode) => boolean)): void;

  onGoToBuilder(): void;

}

export const FulltextSearch = (props: FulltextSearchProps) => {

  const { t } = useTranslation('knowledgegraph');

  const { search } = useFulltextSearch(props.annotations);

  const [query, setQuery] = useState('');

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

      <div className="mt-3 flex justify-end">
        <button 
          className="flex items-center text-[11.5px] text-muted-foreground gap-0.5 mr-0.5 hover:underline hover:text-black "
          onClick={props.onGoToBuilder}>
          <ChevronRight className="h-3 w-3" /> {t('graphSearch.useQueryBuilder')}
        </button>
      </div>
    </div>
  )
  
}