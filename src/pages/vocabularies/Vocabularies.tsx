import { ArrowLeftRight, Braces, Tags, Workflow } from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/Tabs';
import { useStore } from '@/store';
import { EntitiesTab } from './entities/EntitiesTab';
import { RelationsTab } from './relations/RelationsTab';

export const Vocabularies = () => {

  const store = useStore({ redirect: true });

  return store &&  (
    <div className="page-root">
      <Sidebar />

      <main className="page vocabularies">
        <Tabs defaultValue="tags">
          <TabsList>
            <TabsTrigger value="tags">
              <Tags size={16} className="mr-2" /> Tags
            </TabsTrigger>

            <TabsTrigger value="entities">
              <Braces size={16} className="mr-2" /> Entities
            </TabsTrigger>

            <TabsTrigger value="relations">
              <ArrowLeftRight size={16} className="mr-2" />  Relations
            </TabsTrigger>

            <TabsTrigger value="graph">
              <Workflow size={16} className="mr-2" />  Graph
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tags" className="p-1">
            Coming soon...
          </TabsContent>

          <TabsContent value="entities">
            <EntitiesTab store={store} />
          </TabsContent>

          <TabsContent value="relations">
            <RelationsTab store={store} />
          </TabsContent>

          <TabsContent value="graph" className="p-1">
            Coming soon...
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )

}