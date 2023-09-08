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

export const RelationsTab = (props: { store: Store }) => {

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
            <TableRow>
              <TableCell className="font-medium">is inside</TableCell>
              <TableCell>R1234</TableCell>
              <TableCell>My own relation, for use with 'City Walls' for example</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <CreateRelation />
    </>
  )

}