import { useEffect, useMemo, useState } from 'react';
import { Cuboid, MessagesSquare, Spline, X} from 'lucide-react';
import { EntityType } from '@/model';
import { Button } from '@/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { AnnotatedImages } from './AnnotatedImages';
import { EntityRelationships } from './EntityRelationships';
import { NODE_COLORS } from '../../Styles';
import { Graph } from '../../Types';
import { useDataModel } from '@/store';

interface SelectedEntityTypeProps {

  graph: Graph;

  type: EntityType;

  onClose(): void;

}

export const SelectedEntityType = (props: SelectedEntityTypeProps) => {

  const { entityTypes } = useDataModel();

  const { graph, type } = props;

  const [annotations, setAnnotations] = useState(0);

  const [tab, setTab] = useState<string>('annotations'); 

  useEffect(() => {
    setAnnotations(0);
  }, [type]);

  const entityRelationships = useMemo(() => (
    graph.getEntityToEntityRelationLinks(type.id)
  ), [type]);

  const relatedEntities = useMemo(() => {    
    const relatedEntityIDs = new Set(entityRelationships.reduce<string[]>((ids, primitive) => {
      return [...ids, primitive.source, primitive.target]
    }, []));

    return [...relatedEntityIDs]
      .map(id => entityTypes.find(e => e.id === id))
      .filter(Boolean);
  }, [entityTypes, entityRelationships]);

  return (
    <div className="p-2">
      <Tabs 
        value={tab}
        onValueChange={setTab}>
        <div className="bg-white shadow-xs rounded border">
          <div className="py-3 px-4">
            <div className="flex justify-between -mr-1.5">
              <div className="flex gap-1.5 items-center grow">
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
                className="shrink-0 h-8 w-8 -mt-0.5 rounded-full"
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

          <div className="pb-3 pt-0.5 px-4 text-[12px] text-muted-foreground/80 flex gap-4">
            <TabsList className="gap-2 bg-transparent p-0">
              <TabsTrigger 
                value="annotations" 
                className="flex gap-1.5 transition-none px-2.5 py-1 pr-3 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white"
                disabled={annotations === 0}>
                <MessagesSquare className="w-3.5 h-3.5 -mt-[1px]" /> 
                <span>
                  {annotations} {tab === 'annotations' && (
                    <>
                      Annotation{annotations === 0 || annotations > 1 ? 's' : ''}
                    </>
                  )}
                </span>
              </TabsTrigger>
    
              <TabsTrigger 
                value="relations" 
                className="flex gap-1.5 transition-none px-2.5 py-1 pr-3 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white"
                disabled={entityRelationships.length === 0}>
                <Spline className="w-3.5 h-3.5 -mt-[1px]" /> 
                <span>
                  {entityRelationships.length} {tab === 'relations' && (
                    <>
                      Relationship{entityRelationships.length === 0 || entityRelationships.length > 1 ? 's' : ''}
                    </>
                  )}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="py-2">
          <TabsContent value="annotations">
            <AnnotatedImages
              graph={graph}
              type={type} 
              onLoadAnnotations={setAnnotations} />
          </TabsContent>

          <TabsContent value="relations">
            <EntityRelationships
              relatedTypes={relatedEntities}
              selectedType={type} 
              relationships={entityRelationships} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );

}