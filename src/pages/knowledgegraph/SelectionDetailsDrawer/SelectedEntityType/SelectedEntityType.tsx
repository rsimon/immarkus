import { useEffect, useMemo, useState } from 'react';
import { Cuboid, Image, MessagesSquare, Spline, X} from 'lucide-react';
import { EntityType } from '@/model';
import { Button } from '@/ui/Button';
import { AnnotatedImages } from './AnnotatedImages';
import { EntityRelationships } from './EntityRelationships';
import { NODE_COLORS } from '../../Styles';
import { Graph, GraphLinkPrimitive, KnowledgeGraphSettings } from '../../Types';
import { useDataModel } from '@/store';

interface SelectedEntityTypeProps {

  graph: Graph;

  settings: KnowledgeGraphSettings;

  type: EntityType;

  onClose(): void;

}

export const SelectedEntityType = (props: SelectedEntityTypeProps) => {

  const { entityTypes } = useDataModel();

  const { graph, settings, type } = props;

  const [annotations, setAnnotations] = useState(0);

  useEffect(() => {
    setAnnotations(0);
  }, [type]);

  const annotatedImages = useMemo(() => (
    graph.getLinkedNodes(type.id).filter(n => n.type === 'IMAGE')
  ), [type]);

  const relatedEntities = useMemo(() => {
    const entityRelationLinks = graph
      .getLinks(type.id)
      .reduce<GraphLinkPrimitive[]>((all, link) => { 
        return [...all, ...link.primitives.filter(p => p.type === 'IS_RELATED_VIA_ANNOTATION')]
      }, []);

    const relatedEntityIDs = new Set(entityRelationLinks.reduce<string[]>((ids, primitive) => {
      return [...ids, primitive.source, primitive.target]
    }, []));

    return [...relatedEntityIDs]
      .map(id => entityTypes.find(e => e.id === id))
      .filter(Boolean)
      .filter(e => e.id !== type.id); // Don't include self
  }, [type, entityTypes]);

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
                className="rounded-full pt-1 pb-0.5 font-medium">
                {type.label || type.id}
              </h2>
            </div>

            <Button 
              className="flex-shrink-0 h-8 w-8 -mt-0.5 rounded-full"
              size="icon"
              variant="ghost"
              onClick={props.onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {type.description ? (
            <p className="p-1 mt-3 text-xs font-light">
              {type.description}
            </p>
          ) : (
            <p className="font-light mt-3 text-xs text-muted-foreground/50 py-6 px-1">
              No description
            </p>
          )}
        </div>

        <div className="pb-3 pt-0.5 px-5 text-[12px] text-muted-foreground/80 flex gap-4">
          {settings.graphMode === 'HIERARCHY' ? (
            <>
              <div className="flex gap-1 items-center">
                <MessagesSquare className="w-3.5 h-3.5 -mt-[1px]" /> 
                <span>{annotations} Annotations</span>
              </div>

              <div className="flex gap-1 items-center">
                <Image className="w-3.5 h-3.5 -mt-[1px]" /> 
                <span>{annotatedImages.length} Images</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex gap-1 items-center">
                <Spline className="w-3.5 h-3.5 -mt-[1px]" /> 
                <span>{relatedEntities.length} Related Classes</span>
              </div>

              <div className="flex gap-1 items-center">
                <Image className="w-3.5 h-3.5 -mt-[1px]" /> 
                <span>{annotatedImages.length} Images</span>
              </div>
            </>
          )}
        </div>
      </div>

      {settings.graphMode === 'HIERARCHY' ? (
        <AnnotatedImages
          graph={graph}
          type={type} 
          onLoadAnnotations={setAnnotations} />
      ) : (
        <EntityRelationships
          graph={graph}
          related={relatedEntities}
          type={type} />
      )}
    </div>
  );

}