import { CaseSensitive, ChevronsLeftRightEllipsis, Database, Hash, Link2, List, MapPin, Ruler } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PropertyListTooltip } from '@/components/PropertyListTooltip';
import { MetadataSchema, PropertyDefinition } from '@/model';
import { MetadataTableActions } from './MetadataTableActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/Table';


interface MetadataTableProps {

  schemas?: MetadataSchema[];

  onEditSchema(schema: MetadataSchema): void;

  onDeleteSchema(schema: string): void;

}

export const MetadataTable = (props: MetadataTableProps) => {

  const { t } = useTranslation('common');

  return (
    <div className="rounded-md border mt-6">
      <Table>
        <TableHeader className="text-xs">
          <TableRow>
            <TableHead className="px-3 whitespace-nowrap">{t('metadataTable.schema')}</TableHead>
            <TableHead className="px-2 whitespace-nowrap w-[280px]">{t('metadataTable.description')}</TableHead>
            <TableHead className="px-2 whitespace-nowrap w-[340px]">{t('metadataTable.properties')}</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {(props.schemas || []).length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-24 text-center text-muted-foreground">
                {t('metadataTable.noSchemas')}
              </TableCell>
            </TableRow>
          ) : props.schemas.map(schema => (
            <TableRow key={schema.name} className="text-xs">
              <TableCell className="whitespace-nowrap py-1 px-3 font-medium">
                {schema.name}
              </TableCell>
              <TableCell className="font-medium p-2 whitespace-nowrap overflow-hidden text-ellipsis py-1 px-2">
                {schema.description}
              </TableCell>
              <TableCell className="py-1 px-2">
                <span className="whitespace-nowrap">
                  {(schema.properties || []).slice(0, 3).map((property: PropertyDefinition) => (
                    <span key={property.name}
                      className="align-middle inline-flex bg-muted-foreground/40 text-dark text-xs whitespace-nowrap
                        mx-0.5 mb-1 py-0.5 px-1.5 rounded-full items-center" style={{ fontSize: '0.65rem'}}>
                      {property.type === 'enum' ? (
                        <List className="size-3 mr-0.5" />
                      ): property.type === 'external_authority' ? (
                        <Database className="size-3 mr-1" />
                      ) : property.type === 'geocoordinate' ? (
                        <MapPin className="size-3 mr-0.5" />
                      ) : property.type === 'measurement' ? (
                        <Ruler className="size-3 mr-1" />
                      ) : property.type === 'number' ? (
                        <Hash className="size-3 mr-0.5" />
                      ) : property.type === 'range' ? (
                        <ChevronsLeftRightEllipsis className="size-3.5 mr-0.5" />
                      ) : property.type === 'text' ? (
                        <CaseSensitive className="size-4 mr-0.5" />
                      ) : property.type === 'uri' ? (
                        <Link2 className="size-3 mr-0.5" />
                      ) : null}
                      {property.name}
                    </span>    
                  ))}

                  {schema.properties?.length > 3 && (
                    <PropertyListTooltip properties={schema.properties} />
                  )}
                </span>
              </TableCell>
              <TableCell className="text-right py-1 px-2">
                <MetadataTableActions
                  onEditSchema={() => props.onEditSchema(schema)} 
                  onDeleteSchema={() => props.onDeleteSchema(schema.name)} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

}