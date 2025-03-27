import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnnotoriousOpenSeadragonAnnotator } from '@annotorious/react';
import { useAnnotoriousManifold, useViewers } from '@annotorious/react-manifold';

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

export const useColorSampling = (onSample: (color: string) => void) => {

  const viewerMap = useViewers();

  const viewers = useMemo(() => viewerMap ? Array.from(viewerMap.values()) : [], [viewerMap]);

  const manifold = useAnnotoriousManifold();
  
  const [_, setUnsubscribe] = useState<Array<() => void>>([]);

  const [isSampling, setIsSampling] = useState(false); 

  const removeHandlers = () => setUnsubscribe(current => {
    current.forEach(fn => fn());
    return [];
  });

  const stopSampling = useCallback(() => {
    if (!manifold) return;
    
    setIsSampling(false);

    manifold.annotators.forEach(anno => 
      (anno as AnnotoriousOpenSeadragonAnnotator).setModalSelect(false));

    removeHandlers();
  }, [manifold]);

  const addHandlers = useCallback(() => {
    const addClickHandler = (viewer: OpenSeadragon.Viewer) => {
      const canvas = viewer.drawer.canvas as HTMLCanvasElement;

      let pointerDownTime = 0;

      const onPointerDown = (event: PointerEvent) => { 
        pointerDownTime = Date.now();
      }

      const onPointerUp = (event: PointerEvent) => {
        const dt = Date.now() - pointerDownTime;
        if (dt > 300) return;

        const { offsetX, offsetY } = event;

        const x = offsetX * devicePixelRatio;
        const y = offsetY * devicePixelRatio;

        const pixel = canvas.getContext('2d').getImageData(x, y, 1, 1).data;
        const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);

        stopSampling();

        onSample(hex);
      }

      viewer.element.addEventListener('pointerdown', onPointerDown);
      viewer.element.addEventListener('pointerup', onPointerUp);

      return () => {
        viewer?.element && viewer.element.removeEventListener('pointerdown', onPointerDown);
        viewer?.element && viewer.element.removeEventListener('pointerup', onPointerUp);
      }
    }

    setUnsubscribe(viewers.map(viewer => addClickHandler(viewer)));
  }, [viewers, onSample]);

  const startSampling = useCallback(() => {
    if (!manifold) return;

    setIsSampling(true);

    manifold.annotators.forEach(anno => 
      (anno as AnnotoriousOpenSeadragonAnnotator).setModalSelect(true));

    addHandlers();
  }, [addHandlers, manifold]);

  const toggleSampling = () => isSampling ? stopSampling() : startSampling();

  useEffect(() => stopSampling(), [viewers]);

  return { startSampling, stopSampling, toggleSampling, isSampling };

}