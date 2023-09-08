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

export const EntitiesTab = (props: { store: Store }) => {

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
            <TableRow>
              <TableCell className="font-medium">City Walls</TableCell>
              <TableCell>E1234</TableCell>
              <TableCell></TableCell>
              <TableCell>My own city walls concept, for use in this project</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="flex mt-4">
        <CreateEntity />

        <Button variant="outline" disabled className="ml-2">
          <Share2 size={16} className="mr-2" /> View Ontology Graph
        </Button>
      </div>
    </>
  )

}