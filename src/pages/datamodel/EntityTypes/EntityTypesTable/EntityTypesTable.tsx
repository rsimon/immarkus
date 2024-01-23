import { CaseSensitive, Database, Hash, Link2, List, MapPin, Ruler } from 'lucide-react';
import { EntityType, PropertyDefinition } from '@/model';
import { DataModel, useDataModel } from '@/store';
import { EntityTypeActions } from '../EntityTypeActions';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/Table';
import { TreeNode } from 'primereact/treenode';

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

  const nodes: TreeNode[] = model.getRootTypes().map(toTreeNode)

  const idTemplate = (node: TreeNode) => (
    <>
      <span className="pip" style={{ backgroundColor: node.data.color }} />
      <span>{node.data.id}</span>
    </>
  )

  const actionsTemplate = (node: TreeNode) => (
    <span className="text-right py-1 px-2">
      <EntityTypeActions 
        onEditEntityType={() => props.onEditEntityType(node.data)} 
        onDeleteEntityType={() => props.onDeleteEntityType(node.data)} />
    </span>
  )

  const propertiesTemplate = (node: TreeNode) => (
    <span>
      {node.data.properties?.map((property: PropertyDefinition) => (
        <span key={property.name}
          className="align-middle inline-flex bg-muted-foreground/40 text-dark text-xs 
            mx-0.5 mb-1 py-0.5 px-1.5 rounded-full items-center" style={{ fontSize: '0.65rem'}}>
          {property.type === 'enum' ? (
            <List className="w-3 h-3 mr-0.5" />
          ): property.type === 'external_authority' ? (
            <Database className="w-3 h-3 mr-1" />
          ) : property.type === 'geocoordinate' ? (
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
    </span>
  )

  const headerClass = "pl-3 pr-2 whitespace-nowrap text-xs text-muted-foreground font-semibold text-left";

  return (
    <div className="rounded-md border mt-6 w-full overflow-auto">
      <TreeTable 
        value={nodes} 
        className="w-full caption-bottom text-sm">

        <Column
          expander
          header="Entity Class" 
          headerClassName={headerClass}
          body={idTemplate} />

        <Column 
          header="Display Name" 
          headerClassName={headerClass}
          field="label" />

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

  /*
          {model.entityTypes.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground">
                No entity classes
              </TableCell>
            </TableRow>
          ) : model.entityTypes.map(e => (
            <TableRow key={e.id} className="text-xs">
              <TableCell className="pl-2 pr-1">
                <span className="pip" style={{ backgroundColor: e.color }} />
              </TableCell>
              <TableCell className="whitespace-nowrap py-1 pl-0.5 pr-2.5">{e.id}</TableCell>
              <TableCell className="font-medium p-2 first-letter:whitespace-nowrap py-1 px-2">{e.label}</TableCell>
              <TableCell className="py-1 px-2">{e.parentId}</TableCell>
              <TableCell className="py-1 px-2">{e.description}</TableCell>
              <TableCell className="py-1 px-2">
                {e.properties?.map(property => (
                  <span key={property.name}
                    className="align-middle inline-flex bg-muted-foreground/40 text-dark text-xs 
                      mx-0.5 mb-1 py-0.5 px-1.5 rounded-full items-center" style={{ fontSize: '0.65rem'}}>
                    {property.type === 'enum' ? (
                      <List className="w-3 h-3 mr-0.5" />
                    ): property.type === 'external_authority' ? (
                      <Database className="w-3 h-3 mr-1" />
                    ) : property.type === 'geocoordinate' ? (
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
              </TableCell>

            </TableRow>
          ))}

  */

}