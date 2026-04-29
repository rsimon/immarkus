import { useContext } from 'react';
import { StoreContext } from '../StoreProvider';
import { Settings } from '../settings';

export const useSettings = () => {

  const { settings, setSettings } = useContext(StoreContext);

  const setAsync = (p: Promise<void>) =>
    p.then(() => setSettings({...settings}));

  const updateSettings = (fn: (current: Settings) => Partial<Settings>) =>
    setAsync(settings.updateSettings(fn));

  return { 
    ...settings,
    updateSettings
  };

}