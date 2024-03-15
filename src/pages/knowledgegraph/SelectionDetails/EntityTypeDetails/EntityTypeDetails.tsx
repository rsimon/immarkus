import { EntityBadge } from '@/components/EntityBadge';
import { EntityType } from '@/model';
import { Graph } from '../../Types';
import { AnnotatedEntities } from './AnnotatedEntities';
import { Separator } from '@/ui/Separator';

interface EntityTypeDetailsProps {

  graph: Graph;

  type: EntityType

}

export const EntityTypeDetails = (props: EntityTypeDetailsProps) => {

  const { type } = props;

  const linkedNodes = props.graph.getLinkedNodes(type.id);

  return (
    <aside className="max-h-[80vh] overflow-y-scroll">
      <div className="p-4">
        <h2><EntityBadge entityType={type} /></h2>
        {type.description && (
          <p className="px-0.5 pt-2 text-sm text-muted-foreground">
            {type.description}
          </p>
        )}
      </div>

      <div className="bg-muted">
        {linkedNodes.map(node => (
          <section 
            key={node.id} 
            className="p-4 border-t">
            <h3 className="text-sm mb-3 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {node.label}
            </h3>

            <AnnotatedEntities 
              key={node.id}
              imageId={node.id} 
              entityType={type} />
          </section>
        ))}
      </div>
    </aside>
  )
  
}