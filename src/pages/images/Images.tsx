import { useEffect, useMemo, useState } from 'react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { Folder, IIIFManifestResource, RootFolder } from '@/model';
import { useStore } from '@/store';
import { ItemGrid } from './ItemGrid';
import { MetadataDrawer } from './MetadataDrawer';
import { GridItem, isPresentationManifest } from './Types';
import { IIIFManifestGrid } from './IIIFManifestGrid';

export const Images = () => {

  const store = useStore();

  const { folder: folderId } = useParams();

  const [selected, setSelected] = useState<GridItem | undefined>();

  const navigate = useNavigate();

  const [hideUnannotated, setHideUnannotated] = useState(false);

  const currentFolder: Folder | RootFolder | IIIFManifestResource = useMemo(() => {
    if (!folderId) return store.getRootFolder();

    // File system folder
    const folder = store.getFolder(folderId);
    if (folder) return folder;

    // IIIF manifest - may contain a range ID after the @
    const [manifestId, _] = folderId.split('@');

    const manifest = store.getIIIFResource(manifestId);
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
          {isPresentationManifest(currentFolder) ? (
            <IIIFManifestGrid 
              manifest={currentFolder} 
              hideUnannotated={hideUnannotated}
              selected={selected}
              onShowMetadata={onShowFolderMetadata}
              onChangeHideUnannotated={setHideUnannotated}
              onSelect={setSelected} />
          ) : (            
            <ItemGrid 
              folder={currentFolder}
              hideUnannotated={hideUnannotated}
              selected={selected}
              onShowMetadata={onShowFolderMetadata} 
              onChangeHideUnannotated={setHideUnannotated}
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