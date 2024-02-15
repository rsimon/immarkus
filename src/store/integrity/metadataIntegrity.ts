import { Store } from '../Store';

export const renameImageSchema = (from: string, to: string, store: Store) => {

  const renameInFolder = (handle: FileSystemDirectoryHandle): Promise<void> => {
    const { images, folders } = store.getFolderContents(handle);

    const p = images.reduce((promise, image) => 
      promise
        .then(() => store.getImageMetadata(image.id))
        .then(metadata => {
          if (metadata?.source === from) {
            const renamed = ({
              ...metadata,
              source: to
            });
  
            return store.upsertImageMetadata(image.id, renamed);  
          } else {
            return Promise.resolve();
          }
        })
    , Promise.resolve());

    if (folders.length === 0) {
      return p;   
    } else {
      return p.then(() => folders.reduce((promise, folder) => promise.then(() => {
        return renameInFolder(folder.handle);
      }), Promise.resolve()));
    }
  }

  const root = store.getRootFolder();
  renameInFolder(root.handle);
  
}

export const renameFolderSchema = (from: string, to: string, store: Store) => {

  const renameInFolder = (handle: FileSystemDirectoryHandle): Promise<void> => {
    const { folders } = store.getFolderContents(handle);

    const p = folders.reduce((promise, folder) => 
      promise
        .then(() => store.getFolderMetadata(folder.id))
        .then(annotation => {

          const metadata = Array.isArray(annotation.body)
            ? annotation.body[0] : annotation.body;

          if (metadata?.source === from) {
            const renamed = ({
              ...metadata,
              source: to
            });
  
            return store.upsertFolderMetadata(folder.id, {
              ...annotation,
              body: renamed
            });  
          } else {
            return Promise.resolve();
          }
        })
    , Promise.resolve());

    if (folders.length === 0) {
      return p;   
    } else {
      return p.then(() => folders.reduce((promise, folder) => promise.then(() => {
        return renameInFolder(folder.handle);
      }), Promise.resolve()));
    }
  }

  const root = store.getRootFolder();
  renameInFolder(root.handle);

}