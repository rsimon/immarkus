import { useEffect, useMemo } from 'react';
import { Viewer, Point } from 'openseadragon';
import { useViewer } from '@annotorious/react';

import './SelectionMask.css';

const SVG = 'http://www.w3.org/2000/svg';

export const viewerOffsetPointToImageXY = (
  viewer: Viewer,
  xy: Point
): Point => {
  const viewport = viewer.viewport;

  if (viewport.getFlip()) {
    const containerSize = viewport.getContainerSize();

    // Mirror X across container center
    const px = containerSize.x - xy.x;
    const py = xy.y;

    // Map mirrored coords to un-rotated viewport coords
    const bounds = viewport.getBoundsNoRotate(true);
    const unrotatedVx = bounds.x + (px / containerSize.x) * bounds.width;
    const unrotatedVy = bounds.y + (py / containerSize.x) * bounds.width;

    const rotation = viewport.getRotation(true);

    if (rotation === 0) {
      // Quicker path if flip but no rotation
      return viewport.viewportToImageCoordinates(new Point(unrotatedVx, unrotatedVy));
    } else {
      // Flip + rotation: counter-rotate viewport point around viewport center
      const center = viewport.getCenter(true);
      const rad = (-rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);

      const dvx = unrotatedVx - center.x;
      const dvy = unrotatedVy - center.y;

      const finalVx = center.x + dvx * cos - dvy * sin;
      const finalVy = center.y + dvx * sin + dvy * cos;

      return viewport.viewportToImageCoordinates(new Point(finalVx, finalVy));
    }
  } else {
    // Quick path if viewport is not flipped
    return viewport.viewportToImageCoordinates(viewport.pointFromPixel(xy, true));
  }
}

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