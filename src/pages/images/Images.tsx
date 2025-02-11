import { useEffect, useMemo, useState } from 'react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { Folder, IIIFManifestResource, RootFolder } from '@/model';
import { useStore } from '@/store';
import { ItemGrid } from './ItemGrid';
import { MetadataDrawer } from './MetadataDrawer';
import { GridItem, isPresentationManifest } from './Types';
import { IIIFManifestGrid } from './IIIFManifestGrid';
import { PageHeader } from './PageHeader';

export const Images = () => {

  const store = useStore();

  const { folder: folderId } = useParams();

  const [selected, setSelected] = useState<GridItem | undefined>();

  const navigate = useNavigate();

  const currentFolder: Folder | RootFolder | IIIFManifestResource = useMemo(() => {
    if (!folderId) return store.getRootFolder();

    const folder = store.getFolder(folderId);
    if (folder) return folder;

    const manifest = store.getIIIFResource(folderId);
    if (manifest?.type === 'PRESENTATION_MANIFEST') return manifest;
  }, [folderId, store]);
 
  if (!currentFolder)
    navigate('/404');

  useEffect(() => {
    // Reset selection when folder changes
    setSelected(undefined);
  }, [folderId]);

  const onShowFolderMetadata = () => setSelected({ type: 'folder', ...currentFolder });

  return store && (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page images flex flex-row p-0 overflow-x-hidden">
        <div className="grow px-12 py-6 overflow-y-auto">
          <PageHeader 
            folder={currentFolder} 
            onShowMetadata={onShowFolderMetadata} />

          {isPresentationManifest(currentFolder) ? (
            <IIIFManifestGrid 
              manifest={currentFolder} 
              selected={selected}
              onSelect={setSelected} />
          ) : (
            <ItemGrid 
              folder={currentFolder}
              selected={selected}
              onSelect={setSelected} />
          )}
        </div>

        <MetadataDrawer 
          item={selected}
          onClose={() => setSelected(undefined)}/>
      </main>
    </div>
  )

}