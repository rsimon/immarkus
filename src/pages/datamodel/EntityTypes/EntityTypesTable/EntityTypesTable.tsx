import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ColumnDef,
  ExpandedState,
  Row,
  createExpandedRowModel,
  flexRender,
  rowExpandingFeature,
  tableFeatures,
  useTable
} from '@tanstack/react-table';
import { PropertyListTooltip } from '@/components/PropertyListTooltip';
import { EntityType, PropertyDefinition } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { cn } from '@/ui/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/ui/Table';
import { EntityTypeActions } from './EntityTypeActions';
import {
  CaseSensitive,
  ChevronRight,
  ChevronsLeftRightEllipsis,
  CopyPlus,
  Database,
  Hash,
  Link2,
  List,
  MapPin,
  Palette,
  Ruler
} from 'lucide-react';

interface EntityTypesTableProps {

  onEditEntityType(type: EntityType): void;

  onDeleteEntityType(type: EntityType): void;

}

interface EntityTypeNode {

  id: string;

  data: EntityType;

  children: EntityTypeNode[];

}

const HEADER_CLASS = 'pl-2 pr-2 whitespace-nowrap text-xs text-muted-foreground font-medium text-left';

const features = tableFeatures({
  rowExpandingFeature,
  expandedRowModel: createExpandedRowModel()
});

export const EntityTypesTable = (props: EntityTypesTableProps) => {

  const { t } = useTranslation('datamodel');

  const model = useDataModel();

  const [expanded, setExpanded] = useState<ExpandedState>({});

  const nodes: EntityTypeNode[] = useMemo(() => {
    const toNode = (type: EntityType): EntityTypeNode => ({
      id: type.id,
      data: { ...type },
      children: model.getChildTypes(type.id).map(toNode)
    });

    return model.getRootTypes()
      .slice().sort((a, b) => {
        const aHasChildren = model.hasChildTypes(a.id);
        const bHasChildren = model.hasChildTypes(b.id);

        if (aHasChildren && !bHasChildren) return -1;

        if (bHasChildren && !aHasChildren) return 1;

        return a.id.localeCompare(b.id);
      }).map(toNode);
  }, [model]);

  const togglerTemplate = useCallback((row: Row<typeof features, EntityTypeNode>) =>
    row.getCanExpand() ? (
      <Button
        variant="ghost"
        size="icon"
        style={{
          marginLeft: `${row.depth * 8}px`
        }}
        className="ml-0.5 rounded-full"
        onClick={() => row.toggleExpanded()}>
        <ChevronRight
          style={{ transform: row.getIsExpanded() ? 'rotateZ(90deg)' : undefined}}
          className="h-4 w-4" />
      </Button>
    ) : (
      <span className="inline-block" style={{ width: `${row.depth * 8 +  40}px`}} />
    ), []);

  const idTemplate = useCallback((node: EntityTypeNode) => (
    <span>
      <span className="pip ml-1 mr-1.5" style={{ backgroundColor: node.data.color }} />
      <span>{node.data.id}</span>
    </span>
  ), []);

  const displayNameTemplate = useCallback((node: EntityTypeNode) => (
    <span className="font-medium">{node.data.label}</span>
  ), []);

  const propertiesTemplate = useCallback((node: EntityTypeNode) => (
    <span className="whitespace-nowrap">
      {(node.data.properties || []).slice(0, 3).map((property: PropertyDefinition) => (
        <span key={property.name}
          className="align-middle inline-flex bg-muted-foreground/40 text-dark text-xs whitespace-nowrap
            mx-0.5 mb-1 py-0.5 px-1.5 rounded-full items-center" style={{ fontSize: '0.65rem'}}>
          {property.type === 'color' ? (
            <Palette className="w-3 h-3 mr-1" />
          ) : property.type === 'enum' ? (
            <List className="w-3 h-3 mr-0.5" />
          ): property.type === 'external_authority' ? (
            <Database className="w-3 h-3 mr-1" />
          ) : property.type === 'geocoordinate' ? (
            <MapPin className="w-3 h-3 mr-0.5" />
          ) : property.type === 'measurement' ? (
            <Ruler className="w-3 h-3 mr-1" />
          ) : property.type === 'number' ? (
            <Hash className="w-3 h-3 mr-0.5" />
          ) : property.type === 'range' ? (
            <ChevronsLeftRightEllipsis className="size-3.5 mr-0.5" />
          ) : property.type === 'text' ? (
            <CaseSensitive className="w-4 h-4 mr-0.5" />
          ) : property.type === 'uri' ? (
            <Link2 className="w-3 h-3 mr-0.5" />
          ) : null}

          {property.name}

          {property.multiple && (
            <CopyPlus className="w-3 h-3 ml-1.5 mr-0.5" />
          )}
        </span>
      ))}

      {node.data.properties?.length > 3 && (
        <PropertyListTooltip properties={node.data.properties} />
      )}
    </span>
  ), []);

  const actionsTemplate = useCallback((node: EntityTypeNode) => (
    <span className="text-right py-1 px-2">
      <EntityTypeActions
        entityType={node.data}
        onEditEntityType={() => props.onEditEntityType(node.data)}
        onDeleteEntityType={() => props.onDeleteEntityType(node.data)} />
    </span>
  ), [props.onEditEntityType, props.onDeleteEntityType]);

  const columns: ColumnDef<typeof features, EntityTypeNode>[] = useMemo(() => [
    {
      id: 'entityClass',
      header: t('entityTypesTable.headerEntityClass'),
      cell: ({ row }) => (
        <div className="flex items-center">
          {togglerTemplate(row)}
          {idTemplate(row.original)}
        </div>
      )
    },
    {
      id: 'displayName',
      header: t('entityTypesTable.headerDisplayName'),
      cell: ({ row }) => displayNameTemplate(row.original)
    },
    {
      id: 'description',
      header: t('entityTypesTable.headerDescription'),
      cell: ({ row }) => row.original.data.description
    },
    {
      id: 'properties',
      header: t('entityTypesTable.headerProperties'),
      cell: ({ row }) => propertiesTemplate(row.original)
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => actionsTemplate(row.original)
    }
  ], [t, togglerTemplate, idTemplate, displayNameTemplate, propertiesTemplate, actionsTemplate]);

  const table = useTable({
    features,
    data: nodes,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getSubRows: row => row.children,
    getRowId: row => row.id
  });

  const columnClassName = (columnId: string) => cn(
    (columnId === 'entityClass' || columnId === 'displayName') && 'whitespace-nowrap',
    columnId === 'description' && 'overflow-hidden text-ellipsis whitespace-nowrap max-w-[240px]',
    columnId === 'properties' && 'whitespace-nowrap w-[240px]',
    columnId === 'actions' && 'w-[80px] text-right'
  );

  return (
    <div className="relative rounded-md border mt-6 w-full overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header, idx) => (
                <TableHead
                  key={header.id}
                  className={cn(columnClassName(header.column.id), HEADER_CLASS, idx === 0 ? 'pl-3' : undefined)}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="p-0">
                <div className="h-24 flex items-center justify-center text-center text-muted-foreground">
                  {t('entityTypesTable.empty')}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map(row => (
              <TableRow key={row.id}>
                {row.getAllCells().map(cell => (
                  <TableCell
                    key={cell.id}
                    className={cn('py-2 px-2 text-xs', columnClassName(cell.column.id))}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )

}
