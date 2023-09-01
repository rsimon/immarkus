import Dexie, { Table } from 'dexie';
import { Image, Annotation, FolderHandle } from '../model';

const checkAndPersistStorage = () => 'storage' in navigator ?
    navigator.storage.persist().then(granted => {
      if (granted) {
        console.log('Storage set to persistent');
      } else {
        throw 'Storage persistence denied by user';
      }
    }) : Promise.reject();

export class Database extends Dexie {

  images!: Table<Image, number>; 
  
  annotations!: Table<Annotation, string>;
  
  handles!: Table<FolderHandle, number>;

  constructor() {
    super('markus-idb');

    this.version(1).stores({
      images: '++id, name, path, data',
      annotations: '&id, image, data',
      handles: '++id, handle, created'
    });
  }
}

export const initDB = (): Promise<Database> => 
  checkAndPersistStorage()
    .then(() => {
      console.log('Initializing database');
      return new Database();
    });