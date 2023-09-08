import { useState } from 'react';
import { Share2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/Table';
import { Button } from '@/components/Button';
import { Store } from '@/store/Store';
import { CreateEntity } from './CreateEntity';
import { Entity } from '@/store/Vocabulary';

export const EntitiesTab = (props: { store: Store }) => {

  const { vocabulary } = props.store;

  const [entities, setEntities] = useState<Entity[]>(vocabulary.entities);

  const onCreateEntity = (e: Entity) => {
    vocabulary.addEntity(e);
    setEntities(vocabulary.entities);
  }

  return (
    <>
      <div className="rounded-md border mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Label</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Parent ID</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {entities.map(e => (
              <TableRow>
                <TableCell className="font-medium">{e.label}</TableCell>
                <TableCell>{e.id}</TableCell>
                <TableCell>{e.parentId}</TableCell>
                <TableCell>{e.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex mt-4">
        <CreateEntity 
          onCreate={onCreateEntity} />

        <Button variant="outline" disabled className="ml-2">
          <Share2 size={16} className="mr-2" /> View Ontology Graph
        </Button>
      </div>
    </>
  )

}