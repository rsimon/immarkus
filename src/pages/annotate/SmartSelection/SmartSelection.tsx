import { useContext, useEffect, useState } from 'react';
import { AnnotoriousOpenSeadragonAnnotator, useAnnotator } from '@annotorious/react';
import { mountOpenSeadragonPlugin } from '@annotorious/plugin-segment-anything/openseadragon';
import { SmartSelectionContext } from './SmartSelectionRoot';

import '@annotorious/plugin-segment-anything/annotorious-plugin-smart-tools.css';

export const SmartSelection = () => {

  const anno = useAnnotator<AnnotoriousOpenSeadragonAnnotator>();

  const { setSamPlugin } = useContext(SmartSelectionContext);

  useEffect(() => {
    if (!anno?.viewer) return;

    const plugin = mountOpenSeadragonPlugin(anno);
    setSamPlugin(plugin);

    anno.on('createAnnotation', annotation => {
      console.log('yay!', annotation);
    })

    return () => {
      plugin.destroy();
    }
  }, [anno]);

  return null;

}