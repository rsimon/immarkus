import { readJSONFile, writeJSONFile } from '../utils';

export interface SettingsStore {

  settings: Settings;

  updateSettings(fn: (current: Settings) => Partial<Settings>): Promise<Settings>;

}

export interface Settings {

  bookmarks?: WorkspaceBookmark[];

}

export interface ImageViewport {

  center: { x: number, y: number };

  zoom: number;

}

export type WorkspaceLayout = string | {
  direction: 'row' | 'column';
  first: WorkspaceLayout;
  second: WorkspaceLayout;
  splitPercentage?: number;
};

export type WorkspaceBookmark = {
  name: string;
  images: string[];
  viewports?: Record<string, ImageViewport>;
  layout?: WorkspaceLayout;
};

export const loadSettingsStore = (
  handle: FileSystemDirectoryHandle
): Promise<SettingsStore> => new Promise(async resolve => {
  const fileHandle = await handle.getFileHandle('_immarkus.settings.json', { create: true });
  const file = await fileHandle.getFile();

  let settings = await readJSONFile<Settings>(file)
    .then(data => (data || {}))
    .catch(() => ({} as Settings));

  const save = () => writeJSONFile(fileHandle, settings);

  const updateSettings = (fn: (current: Settings) => Partial<Settings>): Promise<Settings> => {
    const patch = fn(settings);

    settings = {
      ...settings,
      ...patch
    };

    return save().then(() => settings);
  }

  resolve({
    get settings() { return { ...settings } },
    updateSettings
  });
});
