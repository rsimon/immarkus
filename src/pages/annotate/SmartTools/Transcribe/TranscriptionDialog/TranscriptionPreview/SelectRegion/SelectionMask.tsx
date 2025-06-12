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

    // Tried and trusted: https://github.com/openseadragon/svg-overlay/blob/master/openseadragon-svg-overlay.js
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

    const onUpdateViewport = () => {
      const p = viewer.viewport.pixelFromPoint(new OpenSeadragon.Point(0, 0), true);
      const zoom = viewer.viewport.getZoom(true);

      // @ts-ignore
      const containerSizeX = viewer.viewport._containerInnerSize.x
      const scale = containerSizeX * zoom;

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