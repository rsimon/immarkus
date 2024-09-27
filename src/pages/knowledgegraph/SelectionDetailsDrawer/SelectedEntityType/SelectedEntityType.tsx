import { useMemo, useState } from 'react';
import { Cuboid, Image, MessagesSquare, X} from 'lucide-react';
import { EntityType } from '@/model';
import { AnnotatedImages } from './AnnotatedImages';
import { RelatedImages } from './RelatedImages';
import { NODE_COLORS } from '../../Styles';
import { Graph, KnowledgeGraphSettings } from '../../Types';
import { Button } from '@/ui/Button';

interface SelectedEntityTypeProps {

  graph: Graph;

  settings: KnowledgeGraphSettings;

  type: EntityType;

  onClose(): void;

}

export const SelectedEntityType = (props: SelectedEntityTypeProps) => {

  const { graph, settings, type } = props;

  const annotatedImages = useMemo(() => (
    graph.getLinkedNodes(type.id).filter(n => n.type === 'IMAGE')
  ), [type]);

  const [annotations, setAnnotations] = useState(0);

  return (
    <div className="p-2">
      <div className="bg-white shadow-sm rounded border">
        <div className="py-3 px-4">
          <div className="flex justify-between -mr-1.5">
            <div className="flex gap-1.5 items-center flex-grow">
              <div 
                className="w-6 h-6 flex text-white items-center justify-center rounded-full"
                style={{ backgroundColor: NODE_COLORS.ENTITY_TYPE }}>
                <Cuboid className="w-3.5 h-3.5" />
              </div>

              <h2 
                className="rounded-full pt-1 pb-0.5">
                {type.label || type.id}
              </h2>
            </div>

            <Button 
              className="flex-shrink-0 rounded-full h-8 w-8 -mt-0.5"
              size="icon"
              variant="ghost"
              onClick={props.onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {type.description ? (
            <p className="bg-muted rounded p-3 mt-3 text-xs font-light text-muted-foreground">
              {type.description}
            </p>
          ) : (
            <p className="bg-muted rounded mt-3 flex justify-center text-xs font-light text-muted-foreground/50 p-6">
              No description
            </p>
          )}
        </div>

        <div className="pt-0.5 pb-2.5 px-4 text-xs text-muted-foreground/80 flex gap-4">
          <div className="flex gap-1 items-center">
            <MessagesSquare className="w-3.5 h-3.5 -mt-[1px]" /> 
            <span>{annotations} Annotations</span>
          </div>

          <div className="flex gap-1 items-center">
            <Image className="w-3.5 h-3.5 -mt-[1px]" /> 
            <span>{annotatedImages.length} Images</span>
          </div>
        </div>
      </div>

      {settings.graphMode === 'HIERARCHY' ? (
        <AnnotatedImages
          graph={graph}
          type={type} 
          onLoadAnnotations={setAnnotations} />
      ) : (
        <RelatedImages
          graph={graph}
          type={type} />
      )}
    </div>
  );

}