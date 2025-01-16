import { ImageService2, ImageService3, Service } from '@iiif/presentation-3';
import { getPropertyValue } from './resourceUtils';
import { DynamicImageServiceResource, ImageRequestOptions } from '../Types';

type ImageService = ImageService2 | ImageService3;

export const isImageService = (data: any): data is ImageService => {
  const t = getPropertyValue<string>(data, 'type');
  return t.startsWith('ImageService');
}

export const parseImageService = (service: Service) => {
  const t = getPropertyValue<string>(service, 'type');

  if (t === 'ImageService2') {
    const service2 = service as ImageService2;

    const labels = ['level0', 'level1', 'level2'];
    const profiles = Array.isArray(service2.profile) ? service2.profile : [service2.profile];

    const levels = profiles
      .map(profile => labels.findIndex(level => profile.toString().includes(level)))
      .filter(l => l > -1)
      .sort((a, b) => b - a); // Sort descending

    return { majorVersion: 2, profileLevel: levels[0] };
  } else if (t) {
    // Image API 3
    const service3 = service as ImageService3;
    return { majorVersion: 3, profileLevel: parseInt(service3.profile)}
  }
}
