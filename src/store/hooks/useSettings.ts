import { useContext } from 'react';
import { StoreContext } from '../StoreProvider';
import { Settings } from '../settings';

export const useSettings = () => {

  const { settings: settingsStore, setSettings } = useContext(StoreContext);

  const updateSettings = (fn: (current: Settings) => Partial<Settings>) =>
    settingsStore.updateSettings(fn).then(settings => setSettings({...settingsStore, settings }));

  return { 
    ...settingsStore,
    updateSettings
  };

}