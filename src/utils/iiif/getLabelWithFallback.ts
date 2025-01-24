import { CozyCanvas } from '../cozy-iiif';

export const getCanvasLabelWithFallback = (canvas: CozyCanvas) => {
  const label = canvas.getLabel(); 
  if (label) return label;
  
  const firstImage = canvas.images[0];
  if (!firstImage) return 'Unnamed (empty)';

  if (firstImage.type === 'dynamic')
    return  `Unnamed (Image API v${firstImage.majorVersion})`;

  if (firstImage.type === 'level0')
    return  `Unnamed (Image API v${firstImage.majorVersion} Lvl 0)`;

  if (firstImage.type === 'static')
    return 'Unnamed (static image)';

  // Should never happen
  return 'Unnamed (unknown)';
}