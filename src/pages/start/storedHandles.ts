import localforage from 'localforage';

export const getStoredHandles = (): Promise<FileSystemDirectoryHandle[]> =>
  localforage.getItem('immarkus-stored-handles').then(value => value ? value as FileSystemDirectoryHandle[] : []);

export const storeHandle = (handle: FileSystemDirectoryHandle) =>
  getStoredHandles().then(stored => 
    localforage.setItem('immarkus-stored-handles', [...stored, handle]));

export const clearStoredHandles = () =>
  localforage.removeItem('immarkus-stored-handles');