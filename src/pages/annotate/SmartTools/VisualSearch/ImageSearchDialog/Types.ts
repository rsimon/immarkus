import { SearchResult } from 'browser-visual-search';
import { LoadedImage } from '@/model';

export interface ResolvedSearchResult extends SearchResult {

  isQueryImage: boolean;

  image: LoadedImage;

}

export type IconSize = 'sm' | 'md' | 'lg';

export type SearchScope = 'this' | 'workspace' | 'all';

export type ModelDownloadStatus = 
  | { state: 'pending' }
  | { state: 'downloading', progress: number }
  | { state: 'ready' };

export const isResolveSearchResult = (arg?: ResolvedSearchResult | LoadedImage): arg is ResolvedSearchResult => {
  if (!arg) return false;
  const r = (arg as ResolvedSearchResult);
  return 'pxBounds' in r && 'normalizedBounds' in r;
}

export const isLoadedImage = (arg?: ResolvedSearchResult | LoadedImage): arg is LoadedImage =>
  Boolean((arg as LoadedImage)?.name);
