import { useEffect, useMemo, useState } from 'react';
import { AppNavigationSidebar } from '@/components/AppNavigationSidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { Folder, IIIFManifestResource, RootFolder } from '@/model';
import { useStore } from '@/store';
import { ItemOverview } from './ItemOverview';
import { MetadataDrawer } from './MetadataDrawer';
import { OverviewItem, isPresentationManifest } from './Types';
import { IIIFManifestOverview } from './IIIFManifestOverview';

import './Images.css';

export const Images = () => {

  const store = useStore();

  const { folder: folderId } = useParams();

  const [selected, setSelected] = useState<OverviewItem | undefined>();

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

  useEffect(() => {
    if (!store) return;
    const root = store.getRootFolder().handle;

    setTimeout(() => {
      console.log('root handle', root);

      const iframe = document.getElementById('proxy');

      const proxy = (iframe as HTMLIFrameElement)?.contentWindow;
      proxy.localStorage.setItem('foobar', 'ads');
      if (proxy) {
        console.log('sending message')
        proxy.postMessage(root, 'http://localhost:5173');
      }
    }, 4000);

  }, [store]);

  const onShowFolderMetadata = () => setSelected({ type: 'folder', ...currentFolder });

  return store && (
    <div className="page-root">
      <AppNavigationSidebar />

      <main className="page images flex flex-row p-0 overflow-x-hidden">
        <div className="grow px-12 py-6 overflow-y-auto">
          {isPresentationManifest(currentFolder) ? (
            <IIIFManifestOverview 
              manifest={currentFolder} 
              hideUnannotated={hideUnannotated}
              selected={selected}
              onShowMetadata={onShowFolderMetadata}
              onChangeHideUnannotated={setHideUnannotated}
              onSelect={setSelected} />
          ) : (            
            <ItemOverview 
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

      <iframe id="proxy" className="absolute top-2 left-2 border border-red-500" height={200} width={200} src="http://localhost:5173"></iframe>

    </div>
  )

}