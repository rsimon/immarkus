import localforage from 'localforage';

export const getStoredHandles = (): Promise<FileSystemDirectoryHandle[]> =>
  localforage.getItem('i-markus-stored-handles').then(value => value ? value as FileSystemDirectoryHandle[] : []);

export const storeHandle = (handle: FileSystemDirectoryHandle) =>
  getStoredHandles().then(stored => 
    localforage.setItem('i-markus-stored-handles', [...stored, handle]));

export const clearStoredHandles = () =>
  localforage.removeItem('i-markus-stored-handles');