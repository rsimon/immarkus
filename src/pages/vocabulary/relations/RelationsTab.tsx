import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/Table';
import { Store, useVocabulary } from '@/store';
import { CreateRelation } from './CreateRelation';
import { Relation } from '@/model';
import { RelationActions } from './RelationActions';


export const RelationsTab = (props: { store: Store }) => {

  const { vocabulary, addRelation } =  useVocabulary();

  const onCreateRelation = (relation: Relation) =>
    addRelation(relation);

  return (
    <>
      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Label</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {vocabulary.relations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground">
                  No entities
                </TableCell>
              </TableRow>
            ) : vocabulary.relations.map(r => (
              <TableRow>
                <TableCell className="font-medium">{r.label}</TableCell>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.description}</TableCell>
                <TableCell className="text-right">
                  <RelationActions />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateRelation 
        onCreate={onCreateRelation}/>
    </>
  )

}