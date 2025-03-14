import { useContext, useEffect } from 'react';
import { AnnotoriousOpenSeadragonAnnotator, useAnnotator } from '@annotorious/react';
import { mountPlugin } from '@annotorious/plugin-boolean-operations';
import { PluginProviderContext } from '../../../PluginProvider';

export const BooleanPlugin = () => {

    const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();
  
    const { setBooleanPlugin } = useContext(PluginProviderContext);
  
    useEffect(() => {
      if (!anno?.viewer) return;
  
      // @ts-ignore
      const plugin = mountPlugin(anno);
      setBooleanPlugin(plugin);
  
      return () => {
        // plugin.destroy();
      }
    }, [anno]);
  
    return null;

}