import { CaseSensitive, ChevronRight, Database, Hash, Link2, List, MapPin, Ruler } from 'lucide-react';
import { TreeNode } from 'primereact/treenode';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { PropertyListTooltip } from '@/components/PropertyListTooltip';
import { EntityType, PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { EntityTypeActions } from './EntityTypeActions';

import './EntityTypesTable.css';

interface EntityTypesTableProps {

  onEditEntityType(type: EntityType): void;

  onDeleteEntityType(type: EntityType): void;

}

export const EntityTypesTable = (props: EntityTypesTableProps) => {

  const model = useDataModel();

  const toTreeNode = (type: EntityType) => ({
    id: type.id,
    key: type.id,
    label: type.id,
    data: { ...type },
    get children() {
      return model.getChildTypes(type.id).map(toTreeNode)
    }
  })

  const nodes: TreeNode[] = model.getRootTypes().map(toTreeNode);

  const togglerTemplate = (node: TreeNode, options: any) => 
    model.hasChildTypes(node.data.id) ? (
      <Button 
        variant="ghost" 
        size="icon"
        style={{ 
          marginLeft: `${options.props.level * 8}px`
        }}
        className={`ml-0.5 rounded-full ${options.containerClassName}`} onClick={options.onClick}>
        <ChevronRight 
          style={{ transform: options.expanded ? 'rotateZ(90deg)' : undefined}}
          className="h-4 w-4 mb-0.5" />
      </Button>
    ) : (
      <span className="inline-block" style={{ width: `${options.props.level * 8 +  40}px`}} />
    );

  const idTemplate = (node: TreeNode) => (
    <span>
      <span className="pip ml-1 mr-1.5" style={{ backgroundColor: node.data.color }} />
      <span>{node.data.id}</span>
    </span>
  )

  const displayNameTemplate = (node: TreeNode) => (
    <span className="font-medium">{node.data.label}</span>
  )

  const propertiesTemplate = (node: TreeNode) => (
    <span className="whitespace-nowrap">
      {(node.data.properties || []).slice(0, 3).map((property: PropertyDefinition) => (
        <span key={property.name}
          className="align-middle inline-flex bg-muted-foreground/40 text-dark text-xs whitespace-nowrap
            mx-0.5 mb-1 py-0.5 px-1.5 rounded-full items-center" style={{ fontSize: '0.65rem'}}>
          {property.type === 'enum' ? (
            <List className="w-3 h-3 mr-0.5" />
          ): property.type === 'external_authority' ? (
            <Database className="w-3 h-3 mr-1" />
          ) : property.type === 'geocoordinates' ? (
            <MapPin className="w-3 h-3 mr-0.5" />
          ) : property.type === 'measurement' ? (
            <Ruler className="w-3 h-3 mr-1" />
          ) : property.type === 'number' ? (
            <Hash className="w-3 h-3 mr-0.5" />
          ) : property.type === 'text' ? (
            <CaseSensitive className="w-4 h-4 mr-0.5" />
          ) : property.type === 'uri' ? (
            <Link2 className="w-3 h-3 mr-0.5" />
          ) : null}
          {property.name}
        </span>    
      ))}

      {node.data.properties?.length > 3 && (
        <PropertyListTooltip properties={node.data.properties} />
      )}
    </span>
  )

  const actionsTemplate = (node: TreeNode) => (
    <span className="text-right py-1 px-2">
      <EntityTypeActions 
        entityType={node.data}
        onEditEntityType={() => props.onEditEntityType(node.data)} 
        onDeleteEntityType={() => props.onDeleteEntityType(node.data)} />
    </span>
  )

  const headerClass = "pl-3 pr-2 whitespace-nowrap text-xs text-muted-foreground font-semibold text-left";

  return (
    <div className="relative rounded-md border mt-6 w-full">
      <TreeTable 
        value={nodes} 
        className="w-full caption-bottom text-sm"
        togglerTemplate={togglerTemplate}
        emptyMessage={(
          <div className="h-24 flex items-center justify-center text-center text-muted-foreground">
            No entity classes
          </div>
        )}>

        <Column
          expander
          header="Entity Class" 
          headerClassName={headerClass}
          body={idTemplate} />

        <Column 
          header="Display Name" 
          headerClassName={headerClass}
          body={displayNameTemplate} />

        <Column 
        header="Description"
        headerClassName={headerClass}
        field="description" />

        <Column
          header="Properties"
          headerClassName={headerClass}
          body={propertiesTemplate} />

        <Column 
          body={actionsTemplate} />
      </TreeTable>
    </div>
  )
  
}