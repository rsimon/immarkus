import { EntityBadge } from '@/components/EntityBadge';
import { EntityType } from '@/model';
import { Graph } from '../../Types';
import { AnnotatedEntities } from './AnnotatedEntities';

interface EntityTypeDetailsProps {

  graph: Graph;

  type: EntityType

}

export const EntityTypeDetails = (props: EntityTypeDetailsProps) => {

  const { type } = props;

  const linkedNodes = props.graph.getLinkedNodes(type.id);

  return (
    <aside className="p-4 max-h-[400px] overflow-y-scroll">
      <div>
        <h2><EntityBadge entityType={type} /></h2>
        {type.description && (
          <p className="px-0.5 pt-2 text-sm text-muted-foreground">
            {type.description}
          </p>
        )}
      </div>

      <div>
        {linkedNodes.map(node => (
          <section key={node.id}>
            <h3 className="mt-5 mb-1.5 text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
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