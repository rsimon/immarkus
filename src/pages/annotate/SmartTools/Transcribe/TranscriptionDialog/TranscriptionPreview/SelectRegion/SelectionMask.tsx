import { useEffect, useMemo } from 'react';
import { useViewer } from '@annotorious/react';
import OpenSeadragon from 'openseadragon';

import './SelectionMask.css';

const SVG = 'http://www.w3.org/2000/svg';

interface SelectionMaskProps {

  x: number;

  y: number;

  w: number;

  h: number;

}

export const SelectionMask = (props: SelectionMaskProps) => {

  const { x, y, w, h } = props;

  const viewer = useViewer();

  const d = useMemo(() => {
    if (!viewer) return;

    const { dimensions } = viewer.world.getItemAt(0).source;

    const outer = `M 0,0 L ${dimensions.x},0 L ${dimensions.x},${dimensions.y} L 0,${dimensions.y} Z`;
    const inner = `M ${x},${y} L ${x},${y + h} L ${x + w},${y + h} L ${x + w},${y} Z`;
  
    return `${outer} ${inner}`;
  }, [x, y, w, h, viewer]);

  useEffect(() => {
    if (!viewer) return;

    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'immarkus-ocr-selection')
    svg.style.position = 'absolute';
    svg.style.left = '0';
    svg.style.top = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';

    const container = document.createElementNS(SVG, 'g');
    svg.appendChild(container);

    const mask = document.createElementNS(SVG, 'path');
    mask.setAttribute('d', d);
    container.appendChild(mask);

    viewer.canvas.appendChild(svg);

    // Cf. https://github.com/annotorious/annotorious/blob/main/packages/annotorious-openseadragon/src/annotation/svg/OSDLayer.svelte
    const onUpdateViewport = () => {
      const containerWidth = viewer.viewport.getContainerSize().x;

      const zoom = viewer.viewport.getZoom(true);
      const p = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(0, 0), true);

      const scale = zoom * containerWidth / viewer.world.getContentFactor();
      container.setAttribute('transform', `translate(${p.x},${p.y}) scale(${scale},${scale})`);
    }

    onUpdateViewport();

    viewer.addHandler('update-viewport', onUpdateViewport);

    return () => {
      viewer.canvas.removeChild(svg);
      viewer.removeHandler('update-viewport', onUpdateViewport);
    }
  }, [viewer, d]);

  return null;

}