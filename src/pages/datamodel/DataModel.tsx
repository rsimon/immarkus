import { Cuboid, Folder, Image } from 'lucide-react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { EntityTypes} from './EntityTypes';
import { ImageMetadata } from './ImageMetadata';
import { FolderMetadata } from './FolderMetadata';

import './DataModel.css';

export const Vocabulary = () => {

  return (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page data-model px-12 py-6">
        <h1 className="text-xl font-semibold tracking-tight mb-4">Data Model</h1>

        <Tabs defaultValue="entityTypes" className="mt-2">
          <TabsList className="gap-2">
            <TabsTrigger value="entityTypes">
              <Cuboid size={16} className="mr-2" /> Entity Classes
            </TabsTrigger>

            <TabsTrigger value="imageMetadata">
              <Image size={16} className="mr-2" /> Image Metadata
            </TabsTrigger>

            <TabsTrigger value="folderMetadata">
              <Folder size={16} className="mr-2" /> Folder Metadata
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entityTypes">
            <EntityTypes />
          </TabsContent>

          <TabsContent value="imageMetadata">
            <ImageMetadata />
          </TabsContent>

          <TabsContent value="folderMetadata">
            <FolderMetadata />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )

}