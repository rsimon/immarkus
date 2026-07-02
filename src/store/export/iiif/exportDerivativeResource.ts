import JSZip from 'jszip';
import { CanvasInformation, IIIFManifestResource } from '@/model';
import { Store } from '@/store';
import { fetchManifest } from '@/utils/iiif';
import { crosswalkAnnotations } from './crosswalkAnnotations';

export const createModifiedLabel = (label: Record<string, string[]> | undefined, suffix: string) => {
  if (!label) return { en: [suffix] };

  return Object.fromEntries(
    Object.entries(label).map(([language, values]) => [
      language,
      values.map(value => (
        value.endsWith(' ') ? `${value}${suffix}` : `${value} ${suffix}`
      ))
    ])
  );
}

const createAnnotationPage = (canvas: CanvasInformation, baseUrl: string, miradorSafe: boolean, store: Store) =>
  store.getAnnotations(`iiif:${canvas.manifestId}:${canvas.id}`).then(annotations => annotations.length > 0 ? {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: `${baseUrl}/${canvas.manifestId}/annotations-${canvas.id}.json`,
    type: 'AnnotationPage',
    items: crosswalkAnnotations(annotations, miradorSafe, store)
  } : undefined);

export const exportDerivativeResource = async (resource: IIIFManifestResource, baseUrl: string, miradorSafe: boolean, store: Store) => {
  const zip = new JSZip();

  // Original manifest
  const manifest = await fetchManifest(resource.uri);

  const annotationPageUrls = new Map<string, string>();

  for (const canvas of resource.canvases) {
    const annotations = await createAnnotationPage(canvas, baseUrl, miradorSafe, store);
    if (annotations) {
      zip.file(`${resource.id}/annotations-${canvas.id}.json`, JSON.stringify(annotations, null, 2));
      annotationPageUrls.set(canvas.uri, annotations.id);
    }
  }

  // Derivative manifest follows recommendations set out in
  // https://iiif.io/api/cookbook/recipe/0464-reuse-manifest/

  // 1. Derivative manifest must have a new ID
  const derivative = { ...manifest.source } as Record<string, any>;
  derivative.id = `${baseUrl}/${resource.id}/manifest.json`;

  // 2. Derivative should modify the label to alert users of the change
  derivative.label = createModifiedLabel(derivative.label, '(annotated with IMMARKUS)');

  derivative.items = (derivative.items || []).map((canvas: any) => {
    const annotationPageUrl = annotationPageUrls.get(canvas.id);
    if (!annotationPageUrl) return canvas;

    return {
      // 3. Canvases (incl. their IDs! remain unchanged!)
      ...canvas,
      annotations: [{
        id: annotationPageUrl,
        type: 'AnnotationPage'
      }]
    };
  });

  // 4. Add a metadata element with a link to the source Manifest and description of changes
  derivative.metadata = [
    ...(derivative.metadata || []),
    {
      label: { en: ['Source'] },
      value: {
        en: [
          `This manifest is a derivative copy of the <a href="${resource.uri}">original manifest</a>, annotated with <a href="https://immarkus.xmarkus.org">IMMARKUS</a>.`
        ]
      }
    }
  ];

  zip.file(`${resource.id}/manifest.json`, JSON.stringify(derivative, null, 2));

  const blob = await zip.generateAsync({ type:'blob' });

  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = `${resource.id}.zip`;
  anchor.click();
}