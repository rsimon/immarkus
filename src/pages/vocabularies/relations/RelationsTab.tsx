import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/Table';
import { Store } from '@/store/Store';
import { CreateRelation } from './CreateRelation';
import { Relation } from '@/store/Vocabulary';

export const RelationsTab = (props: { store: Store }) => {

  const { vocabulary } = props.store;

  const [relations, setRelations] = useState<Relation[]>(vocabulary.relations);

  const onCreateRelation = (relation: Relation) => {
    vocabulary.addRelation(relation);
    setRelations(vocabulary.relations);
  }

  return (
    <>
      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Label</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {relations.map(r => (
              <TableRow>
                <TableCell className="font-medium">{r.label}</TableCell>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.notes}</TableCell>
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