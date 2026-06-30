import { IIIFManifestResource } from '@/model';
import { Store } from '@/store';
import { fetchManifest } from '@/utils/iiif';

export const exportDerivativeResource = async (resource: IIIFManifestResource, baseUrl: string, store: Store) => {
  const manifest = await fetchManifest(resource.uri);

}