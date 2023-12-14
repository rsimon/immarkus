import { Braces, Tags, ListTree } from 'lucide-react';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { useStore } from '@/store';
import { EntitiesTab } from './entities/EntitiesTab';

import './Vocabulary.css';

export const Vocabulary = () => {

  const store = useStore({ redirect: true });

  return store &&  (
    <div className="page-root">
      <NavigationSidebar />

      <main className="page vocabularies">
        <h1 className="text-xl font-semibold tracking-tight mb-4">Vocabulary Management</h1>
        <p className="text-sm text-muted-foreground max-w-lg leading-6 mb-8">
          This will be the area where you can define concepts (and, possibly, property schemas for them),
          relations and tagging vocabularies.
        </p>

        <Tabs defaultValue="entities" className="mt-2">
          <TabsList>
            <TabsTrigger value="entities">
              <Braces size={16} className="mr-2" /> Entities
            </TabsTrigger>

            <TabsTrigger value="tags">
              <Tags size={16} className="mr-2" /> Tags
            </TabsTrigger>

            <TabsTrigger value="graph">
              <ListTree size={16} className="mr-2" />  Ontology
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            value="tags"
            className="p-1 mt-4 text-sm max-w-lg leading-6">
            When starting a new annotation project, it might be useful to simply 
            start with free-form tags. (I.e. no semantic concepts or relations.)
            This tab could provide an overview of the tags already used in the images,
            as well as the option to add tags.
            
            Tags could then be used in the image annotation interface for auto- 
            completion.
          </TabsContent>

          <TabsContent value="entities">
            <EntitiesTab store={store} />
          </TabsContent>

          <TabsContent 
            value="graph" 
            className="p-1 mt-4 text-sm max-w-lg leading-6">
            The full vocabulary (entites, their classes and properties) is likely going to 
            evolve into a tree - which we could show in full here.
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )

}