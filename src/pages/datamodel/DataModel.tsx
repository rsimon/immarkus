import { Cuboid, Folder, Image, Spline } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { EntityTypes} from './EntityTypes';
import { ImageMetadata } from './ImageMetadata';
import { FolderMetadata } from './FolderMetadata';
import { Relationships } from './Relationships';

import './DataModel.css';

export const Vocabulary = () => {

  const { t } = useTranslation('datamodel');

  return (
    <>
      <AppNavigationSidebar />

      <main className="page grow data-model px-12 py-6 overflow-auto">
        <h1 className="text-xl font-semibold tracking-tight mb-4">{t('title')}</h1>

        <Tabs defaultValue="entityTypes" className="mt-2">
          <TabsList className="gap-2">
            <TabsTrigger value="entityTypes">
              <Cuboid size={16} className="mr-2" /> {t('tabs.entityClasses')}
            </TabsTrigger>

            <TabsTrigger value="relationships">
              <Spline size={16} className="mr-2" /> {t('tabs.relationships')}
            </TabsTrigger>

            <TabsTrigger value="imageMetadata">
              <Image size={16} className="mr-2" /> {t('tabs.imageMetadata')}
            </TabsTrigger>

            <TabsTrigger value="folderMetadata">
              <Folder size={16} className="mr-2" /> {t('tabs.folderMetadata')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entityTypes">
            <EntityTypes />
          </TabsContent>

          <TabsContent value="relationships">
            <Relationships />
          </TabsContent>

          <TabsContent value="imageMetadata">
            <ImageMetadata />
          </TabsContent>

          <TabsContent value="folderMetadata">
            <FolderMetadata />
          </TabsContent>
        </Tabs>
      </main>
    </>
  )

}