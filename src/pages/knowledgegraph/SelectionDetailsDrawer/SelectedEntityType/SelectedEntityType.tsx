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

  const entityRelationships = useMemo(() => (
    graph
      .getLinks(type.id)
      .reduce<GraphLinkPrimitive[]>((all, link) => (
        [...all, ...link.primitives.filter(p => p.type === 'IS_RELATED_VIA_ANNOTATION')]
      ), [])
  ), [type]);

  const relatedEntities = useMemo(() => {
    const relatedEntityIDs = new Set(entityRelationships.reduce<string[]>((ids, primitive) => {
      return [...ids, primitive.source, primitive.target]
    }, []));

    return [...relatedEntityIDs]
      .map(id => entityTypes.find(e => e.id === id))
      .filter(Boolean)
      .filter(e => e.id !== type.id); // Don't include self
  }, [entityTypes, entityRelationships]);

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
                <span>
                  {entityRelationships.length} Relationship{entityRelationships.length === 0 || entityRelationships.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex gap-1 items-center">
                <Cuboid className="w-3.5 h-3.5 -mt-[1px]" /> 
                <span>
                  {relatedEntities.length} Entity Class{relatedEntities.length === 0 || relatedEntities.length > 1 ? 'es' : ''}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="py-2">
        {settings.graphMode === 'HIERARCHY' ? (
          <AnnotatedImages
            graph={graph}
            type={type} 
            onLoadAnnotations={setAnnotations} />
        ) : (
          <EntityRelationships
            relatedTypes={relatedEntities}
            selectedType={type} 
            relationships={entityRelationships} />
        )}
      </div>
    </div>
  );

}