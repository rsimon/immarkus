import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Grip, X } from 'lucide-react';
import { useDraggable } from '@neodrag/react';
import { W3CAnnotation } from '@annotorious/react';
import { Button } from '@/ui/Button';
import { Graph, GraphNode, KnowledgeGraphSettings } from '../Types';
import { useSearchDialogPos } from '../KnowledgeGraphState';
import { FulltextSearch } from './fulltext';
import { Builder } from './builder';

interface GraphSearchProps {

  annotations: { sourceId: string, annotations: W3CAnnotation[] }[];

  graph: Graph;

  isFullscreen: boolean;

  query?:((n: GraphNode) => boolean);

  settings: KnowledgeGraphSettings;

  onChangeQuery(query?: ((n: GraphNode) => boolean)): void;

  onClose(): void;

}

export const GraphSearch = (props: GraphSearchProps) => {

  const { t } = useTranslation('knowledgegraph');

  const el = useRef<HTMLDivElement>(null);

  const { position, setPosition } = useSearchDialogPos({ x: props.isFullscreen ? 10 : 260, y: 10 });

  const [tab, setTab] = useState<'fulltext' | 'builder'>('fulltext');
   
  useDraggable(el, {
    position,
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY })
  });

  return createPortal(
    <div 
      ref={el}
      className="bg-white min-w-127.5 min-h-20 backdrop-blur-xs border absolute top-0 left-0 rounded shadow-lg z-30">
    
      <div className="flex justify-between items-center pl-2 pr-1 py-1 border-b cursor-move text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Grip className="w-4 h-4 mb-0.5" />
          <span>{t('graphSearch.title')}</span>
        </div>

        <Button 
          variant="ghost" 
          size="icon"
          className="p-0 h-auto w-auto"
          onClick={props.onClose}>
          <X className="h-8 w-8 p-2" />
        </Button>
      </div>

      <div>
        {tab === 'fulltext' ? (
          <FulltextSearch 
            annotations={props.annotations}
            graph={props.graph}
            query={props.query}
            settings={props.settings}
            onChangeQuery={props.onChangeQuery}
            onGoToBuilder={() => setTab('builder')} />
        ) : (
          <Builder 
            annotations={props.annotations}
            graph={props.graph}
            isFullscreen={props.isFullscreen}
            settings={props.settings} 
            query={props.query}
            onChangeQuery={props.onChangeQuery}
            onGoToFulltextSearch={() => setTab('fulltext')} />
        )}
      </div>
    </div>, document.body
  )

}