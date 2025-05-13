import { CozyCanvas, CozyRange } from 'cozy-iiif';
import { W3CAnnotation } from '@annotorious/react';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import { CanvasItem, OverviewItem } from '../Types';

export interface IIIFManifestOverviewLayoutProps {

  annotations: Record<string, W3CAnnotation[]>;

  canvases: CanvasInformation[];

  folders: CozyRange[];

  hideUnannotated: boolean;

  manifest: IIIFManifestResource;

  selected?: OverviewItem;

  onOpenCanvas(canvas: CozyCanvas): void;

  onOpenRange(range: CozyRange): void;

  onSelect(item: CanvasItem): void;

}