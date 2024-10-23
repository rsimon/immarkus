import { useCallback, useState } from 'react';
import { ArrowDownToDot, ArrowUpFromDot, Check, Spline } from 'lucide-react';
import { RelationshipTypeEditor } from '@/components/RelationshipTypeEditor';
import { RelationshipType } from '@/model';
import { useDataModel } from '@/store';
import { Button } from '@/ui/Button';
import { getBrightness } from '@/utils/color';
import { RelationshipActions } from './RelationshipActions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/Table';

export const Relationships = () => {

  const model = useDataModel();

  const { relationshipTypes, removeRelationShipType } = model;

  const [edited, setEdited] = useState<RelationshipType | undefined>();

  const onDelete = (name: string) => {
    removeRelationShipType(name).catch(error => {
      console.error(error);
    });
  }

  const renderEntityType = useCallback((id: string, isSource: boolean) => {
    const entity = model.getEntityType(id);

    const brightness = getBrightness(entity.color);

    return (
      <div className="flex gap-1.5 items-center text-black text-xs">
        <div 
          className="rounded-full text-white p-0.5" 
          style={{ 
            backgroundColor: entity.color, 
            color: brightness > 0.5 ? '#000' : '#fff'  
          }}>
          {isSource ? (
            <ArrowUpFromDot className="h-3.5 w-3.5" /> 
          ) : (
            <ArrowDownToDot className="h-3.5 w-3.5" />
          )}
        </div>
        <span>{entity.label || entity.id}</span>
      </div>
    )
  }, [model]);
 
  return (
    <>
      <div>
        <p className="p-1 mt-4 text-sm max-w-xl leading-6">
          You can connect two annotations through a Relationship. A Relationship has a 
          name (e.g. 'is next to' or 'is part of') and can be directed or undirected.
        </p>

        <div className="rounded-md border mt-6">
          <Table>
            <TableHeader className="text-xs">
              <TableRow>
                <TableHead className="px-3 whitespace-nowrap">Relationship Name</TableHead>
                <TableHead className="px-2 whitespace-nowrap w-[280px]">Description</TableHead>
                <TableHead className="px-2 whitespace-nowrap text-center">Directed</TableHead>
                <TableHead className="px-2 whitespace-nowrap">Source Class</TableHead>
                <TableHead className="px-2 whitespace-nowrap">Target Class</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>

            <TableBody>
              {relationshipTypes.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground">
                    No relationship types defined
                  </TableCell>
                </TableRow>
              ) : relationshipTypes.map(rel => (
                <TableRow key={rel.name} className="text-xs">
                  <TableCell className="whitespace-nowrap font-medium py-1.5 px-3">
                    {rel.name}
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-1.5 px-3">
                    {rel.description}
                  </TableCell>

                  <TableCell className="py-1.5 flex-grow px-3">
                    <div className="flex items-center justify-center">
                    {rel.directed && ( <Check size={18} /> )}
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-1.5 px-3">
                    {rel.sourceTypeId && renderEntityType(rel.sourceTypeId, true)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-1.5 px-3">
                    {rel.targetTypeId && renderEntityType(rel.targetTypeId, false)}
                  </TableCell>

                  <TableCell className="whitespace-nowrap py-1.5 px-3 text-right">
                    <RelationshipActions 
                      onDelete={() => onDelete(rel.name)}
                      onEdit={() => setEdited(rel)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex mt-4 gap-2">
          <RelationshipTypeEditor>
            <Button>
              <Spline size={16} className="mr-2" /> Add Relationship Type
            </Button>
          </RelationshipTypeEditor>
        </div>
      </div>

      {Boolean(edited) && (
        <RelationshipTypeEditor 
          open={true} 
          relationshipType={edited}
          onClose={() =>setEdited(undefined)} />
      )}
    </>
  )

}