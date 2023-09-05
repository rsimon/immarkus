import { useState } from 'react';
import { ArrowLeftRight, Braces, Workflow } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import { useStore } from '@/store';
import { Button } from '@/components/Button';
import { DummyGraph } from './Graph';

type Entity = {
  
  name: string

  id: string

  notes: string

}

export const Vocabularies = () => {

  const store = useStore({ redirect: true });

  const [entities, setEntities] = useState<Entity[]>([]);

  return store &&  (
    <div className="page-root">
      <Sidebar />

      <main className="page vocabularies">
        <Tabs 
          defaultValue="entities">

          <TabsList>
            <TabsTrigger value="entities">
              <Braces size={16} className="mr-2" /> Entities
            </TabsTrigger>

            <TabsTrigger value="relations">
              <ArrowLeftRight size={16} className="mr-2" />  Relations
            </TabsTrigger>

            <TabsTrigger value="graph">
              <Workflow size={16} className="mr-2" /> Graph
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entities">
            <div className="rounded-md border mt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">City Walls</TableCell>
                    <TableCell>E1234</TableCell>
                    <TableCell>My own city walls concept, for use in this project</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <Button className="mt-4">Create New Entity</Button>
          </TabsContent>

          <TabsContent value="relations">
            <div className="rounded-md border mt-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Name</TableHead>
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

            <Button className="mt-4">Create New Relation</Button>
          </TabsContent>

          <TabsContent value="graph">
            <DummyGraph />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )

}