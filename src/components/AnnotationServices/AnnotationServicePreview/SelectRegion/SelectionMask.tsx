import { useEffect, useMemo } from 'react';
import { Point } from 'openseadragon';
import { useViewer } from '@annotorious/react';
import { rotatedToImageCoordinates } from '../../rotationUtils';

import './SelectionMask.css';

const SVG = 'http://www.w3.org/2000/svg';

interface SelectionMaskProps {

  x: number;

  y: number;

  w: number;

  h: number;

  rotation?: number;

  isFlipped?: boolean;

}

export const SelectionMask = (props: SelectionMaskProps) => {

  const { x, y, w, h } = props;

  const viewer = useViewer();

  const d = useMemo(() => {
    if (!viewer) return;

    const dimensions = viewer.world.getItemAt(0)?.source?.dimensions;
    if (!dimensions) return;

    const outer = `M 0,0 L ${dimensions.x},0 L ${dimensions.x},${dimensions.y} L 0,${dimensions.y} Z`;
    const corners = [
      rotatedToImageCoordinates({ x, y }, dimensions.x, dimensions.y, props.rotation ?? 0, !!props.isFlipped),
      rotatedToImageCoordinates({ x: x + w, y }, dimensions.x, dimensions.y, props.rotation ?? 0, !!props.isFlipped),
      rotatedToImageCoordinates({ x: x + w, y: y + h }, dimensions.x, dimensions.y, props.rotation ?? 0, !!props.isFlipped),
      rotatedToImageCoordinates({ x, y: y + h }, dimensions.x, dimensions.y, props.rotation ?? 0, !!props.isFlipped)
    ];
    const inner = `M ${corners.map(point => `${point.x},${point.y}`).join(' L ')} Z`;
  
    return `${outer} ${inner}`;
  }, [x, y, w, h, props.rotation, props.isFlipped, viewer]);

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
    mask.setAttribute('fill-rule', 'evenodd');
    container.appendChild(mask);

    viewer.canvas.appendChild(svg);

    // Cf. https://github.com/annotorious/annotorious/blob/main/packages/annotorious-openseadragon/src/annotation/svg/OSDLayer.svelte
    const onUpdateViewport = () => {
      const containerWidth = viewer.viewport.getContainerSize().x;

      const zoom = viewer.viewport.getZoom(true);
      const rotation = viewer.viewport.getRotation(true);
      const p = viewer.viewport.pixelFromPoint(new Point(0, 0), true);

      const scale = zoom * containerWidth / viewer.world.getContentFactor();

      const base = `translate(${p.x}, ${p.y}) scale(${scale}, ${scale}) rotate(${rotation})`;
      const transform = viewer.viewport.getFlip()
        ? `translate(${containerWidth}, 0) scale(-1, 1) ${base}`
        : base;

      container.setAttribute('transform', transform);
    }

    onUpdateViewport();

    viewer.addHandler('update-viewport', onUpdateViewport);

    return () => {
      viewer.canvas?.removeChild(svg);
      viewer.removeHandler('update-viewport', onUpdateViewport);
    }
  }, [viewer, d]);

  return null;

}