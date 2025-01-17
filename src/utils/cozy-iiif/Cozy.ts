import { Canvas, Manifest } from '@iiif/presentation-3';
import { convertPresentation2  } from '@iiif/parser/presentation-2';
import { Traverse } from '@iiif/parser';
import { getImages, getLabel, getPropertyValue, normalizeServiceUrl, parseImageService } from './utils/iiif';
import { CozyCanvas, CozyManifest, CozyParseResult, ImageServiceResource } from './Types';

export const Cozy = {
  
  parseURL: async (input: string): Promise<CozyParseResult> => {
    try {
      new URL(input);
    } catch {
      return {
        type: 'error',
        code: 'INVALID_URL',
        message: 'The provided input is not a valid URL'
      };
    }

    let response: Response;

    try {
      response = await fetch(input);
      if (!response.ok) {
        throw new Error(`Error: HTTP ${response.status}`);
      }
    } catch (error) {
      return {
        type: 'error',
        code: 'FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Failed to fetch resource'
      };
    }

    const contentType = response.headers.get('content-type');
    
    if (contentType?.startsWith('image/')) {
      return {
        type: 'plain-image',
        url: input
      };
    }

    if (contentType?.includes('text/html')) {
      return {
        type: 'webpage',
        url: input
      };
    }

    try {
      const json = await response.json();

      const context = Array.isArray(json['@context'])
        ? json['@context'].find(str => str.includes('iiif.io/api/'))
        : json['@context'];

      if (!context) {
        return {
          type: 'error',
          code: 'INVALID_MANIFEST', 
          message: 'Missing @context'
        }
      };

      const id = getPropertyValue<string>(json, 'id');

      if (!id) {
        return { 
          type: 'error',
          code: 'INVALID_MANIFEST', 
          message: 'Missing id property' 
        }
      }

      if (context.includes('presentation/2') || context.includes('presentation/3')) {
        const majorVersion = context.includes('presentation/2') ? 2 : 3;

        return {
          type: 'manifest',
          url: input,
          resource: parseManifestResource(json, majorVersion)
        };
      }
      
      if (context.includes('image/2') || context.includes('image/3')) {
        const resource = parseImageResource(json);
        return resource ? {
          type: 'iiif-image',
          url: input,
          resource
        } : {
          type: 'error',
          code: 'INVALID_MANIFEST',
          message: 'Invalid image service definition'
        }
      }

      return {
        type: 'error',
        code: 'INVALID_MANIFEST',
        message: 'JSON resource is not a recognized IIIF format'
      };
    } catch {
      return {
        type: 'error',
        code: 'UNSUPPORTED_FORMAT',
        message: 'Could not parse resource'
      };
    }

  }

}

const parseManifestResource = (resource: any, majorVersion: number): CozyManifest => {

  const parseV3 = (manifest: Manifest) => {
    const canvases: Canvas[] = [];

    const modelBuilder = new Traverse({
      canvas: [canvas => { if (canvas.items) canvases.push(canvas) }]
    });
  
    modelBuilder.traverseManifest(manifest);
    
    return canvases.map((c: Canvas) => ({
      source: c,
      id: c.id,
      label: getLabel(c),
      width: c.width,
      height: c.height,
      images: getImages(c)
    } as CozyCanvas));
  }

  const v3: Manifest = majorVersion === 2 ? convertPresentation2(resource) : resource;

  const canvases = parseV3(v3);

  return {
    source: v3,
    id: v3.id,
    majorVersion,
    label: getLabel(v3),
    canvases
  }
}

const parseImageResource = (resource: any) => {
  const { width, height } = resource;

  const service = parseImageService(resource);
  if (service) {
    return {
      type: service.profileLevel === 0 ? 'level0' : 'dynamic',
      service: resource,
      width,
      height,
      majorVersion: service.majorVersion,
      serviceUrl: normalizeServiceUrl(getPropertyValue<string>(resource, 'id'))
    } as ImageServiceResource;
  }
}