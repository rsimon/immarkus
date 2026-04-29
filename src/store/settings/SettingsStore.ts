import { readJSONFile, writeJSONFile } from '../utils';

export interface SettingsStore {

  settings: Settings;

  updateSettings(fn: (current: Settings) => Partial<Settings>): Promise<void>;

}

export interface Settings {

  bookmarks?: WorkspaceBookmark[];

}

export type WorkspaceBookmark = { name: string, images: string[] };

export const loadSettingsStore = (
  handle: FileSystemDirectoryHandle
): Promise<SettingsStore> => new Promise(async resolve => {
  const fileHandle = await handle.getFileHandle('_immarkus.settings.json', { create: true });
  const file = await fileHandle.getFile();

  let settings = await readJSONFile<Settings>(file)
    .then(data => (data || {}))
    .catch(() => ({} as Settings));

  const save = () => writeJSONFile(fileHandle, settings);

  const updateSettings = (fn: (current: Settings) => Partial<Settings>): Promise<void> => {
    const patch = fn(settings);
    settings = {
      ...settings,
      ...patch
    };

    return save();
  }

  resolve({
    get settings() { return { ...settings } },
    updateSettings
  });
});

