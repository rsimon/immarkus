import { useContext, useEffect } from 'react';
import { AnnotoriousOpenSeadragonAnnotator, useAnnotator } from '@annotorious/react';
import { mountOpenSeadragonPlugin } from '@annotorious/plugin-segment-anything/openseadragon';
import { PluginProviderContext } from '../PluginProvider';

import '@annotorious/plugin-segment-anything/annotorious-plugin-smart-tools.css';

export const SmartSelection = () => {

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const { setSamPlugin } = useContext(PluginProviderContext);

  useEffect(() => {
    if (!anno?.viewer) return;

    const plugin = mountOpenSeadragonPlugin(anno, { maxPreviewCoverage: 0.33 });
    setSamPlugin(plugin);

    return () => {
      plugin.destroy();
    }
  }, [anno]);

  return null;

}