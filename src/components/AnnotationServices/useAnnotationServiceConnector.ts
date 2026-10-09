import { useCallback, useMemo, useRef, useState } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { EntityType, LoadedImage } from '@/model';
import { preprocess } from './preprocess';
import { AnnotationServiceInput, AnnotationServiceStatus } from './Types';
import { 
  AnnotationServiceOptions, 
  AnnotationServiceResult, 
  ProcessingState, 
  ServiceRegistry, 
  ServiceType, 
  useService 
} from '@/services';

const OPS = {
  TRANSCRIPTION: { submit: 'transcribe', parse: 'parseTranscriptionResponse' },
  ANNOTATION:    { submit: 'annotate',   parse: 'parseAnnotationResponse' },
  TRANSLATION:   { submit: 'translate', parse: undefined }
} as const satisfies Record<ServiceType, { submit: string, parse?: string }>;

const blobToDataURL = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === 'string')
      resolve(reader.result);
    else
      reject(new Error('Failed to read submitted image as a data URL'));
  };
  reader.onerror = () => reject(reader.error ?? new Error('Failed to read submitted image'));
  reader.readAsDataURL(blob);
});

export const useAnnotationServiceConnector = (type: ServiceType, image: LoadedImage) => {
  const [options, setOptions] = useState<AnnotationServiceOptions>({
    connectorId: ServiceRegistry.listAvailableConnectors(type)[0].id 
  });

  const [tags, setTags] = useState<EntityType[]>([]);

  const [input, setInput] = useState<AnnotationServiceInput>({ rotation: 0, isFlipped: false });

  const [status, setStatus] = useState<AnnotationServiceStatus>({});

  const [results, setResults] = useState<AnnotationServiceResult[] | undefined>();

  const runId = useRef(0);

  const service = useService(options.connectorId, type);

  const setConnector = useCallback((connectorId: string) => {
    runId.current++;
    setOptions({ connectorId });
    setResults(undefined);
    setStatus({});
  }, []);

  const setServiceOption = useCallback((key: string, value: string) =>
    setOptions(current => ({
      ...current,
      serviceOptions: {
        ...(current.serviceOptions || {}),
        [key]: value
      }
    })), []);

  const updateInput = useCallback((patch: Partial<AnnotationServiceInput>) => {
    runId.current++;
    setInput(cur => ({ ...cur, ...patch }));
    setStatus({});
  }, []);

  const batches = useMemo(() => {
    if ((results || []).length === 0) return; // No (successful) annotation run yet

    return results.map(result => {
      const { crosswalk, data, generator, region, transform } = result;
      
      try {
        const annotations = crosswalk(data, transform, region, options.serviceOptions);
        return { annotations, generator };
      } catch (error) {
        console.error(error);
        return { annotations: [], generator: result.generator };
      }
    });
  }, [results, options]);
  
  const annotations = useMemo(() => {
    if (!batches) return;

    return batches.reduce<ImageAnnotation[]>((all, batch) => ([...all, ...batch.annotations]), [])
  }, [batches]);

  const submit = useCallback(() => { 
    if (!service.connector) return;

    // Temporary development aid for inspecting the exact submitted image.
    const debugWindow = import.meta.env.DEV ? window.open('about:blank', '_blank') : null;
    if (debugWindow)
      debugWindow.document.write('Preparing submitted image preview…');
    else if (import.meta.env.DEV)
      console.warn('Submitted image preview tab was blocked by the browser.');

    const id = ++runId.current;
    const isStale = () => id !== runId.current;

    const onUpdateState = (state: ProcessingState) => {
      if (!isStale()) setStatus({ state });
    }

    preprocess(image, input.region, input.rotation, input.isFlipped, onUpdateState).then(result => {
      if (isStale()) return;

      onUpdateState('pending');

      const image = 'file' in result ? result.file : result.url;
      if (typeof image === 'string')
        console.info('IIIF URL sent to annotation service:', image);

      if (debugWindow) {
        const submittedBlob = typeof image === 'string'
          ? fetch(image).then(response => {
              if (!response.ok)
                throw new Error(`Failed to fetch submitted image (${response.status} ${response.statusText})`);
              return response.blob();
            })
          : Promise.resolve(image);

        submittedBlob
          .then(blobToDataURL)
          .then(dataURL => {
            if (!debugWindow.closed)
              debugWindow.location.replace(dataURL);
          })
          .catch(error => console.error('Failed to open submitted image preview:', error));
      }

      const submittedRegion = input.region
        ? result.transform({
            x: 0,
            y: 0,
            w: result.transform.source.width,
            h: result.transform.source.height
          })
        : undefined;

      const parseFn = OPS[type].parse;
      if (!parseFn) return;

      const crosswalk =  service.connector[parseFn];
      service.connector[OPS[type].submit](image, result.transform, options.serviceOptions, tags).then(({ data, generator }) => {
        if (isStale()) return;

        // console.log(data);

        // Test the crosswalk to make sure data is valid
        try {
          const annotations = crosswalk(data, result.transform, submittedRegion, options.serviceOptions);

          setResults(current => [...(current || []), { 
            data, 
            generator,
            transform: result.transform,
            region: submittedRegion,
            crosswalk
          }]);

          if (annotations.length > 0)
            onUpdateState('success')
          else 
            onUpdateState('success_empty');
        } catch (error) {
          setStatus({ state: 'service_failed', error: error.message });
        }
      }).catch((error: Error) => {
        if (isStale()) return;
        setStatus({ state: 'service_failed', error: error.message });
      });   
    }).catch((error: Error) => {
      console.log('ERRROR', error);

      if (isStale()) return;
      setStatus({ state: 'service_failed', error: error.message });
    });
  }, [image, input, tags, options, service, setStatus, setResults]);

  const clearResults = useCallback(() => {
    runId.current++;
    setResults(undefined);
    setStatus({});
  }, []);

  const reset = useCallback(() => {
    runId.current++;
    setInput({ rotation: 0, isFlipped: false });
    setResults(undefined);
    setStatus({});
  }, []);

  return { 
    // Connector config
    options, 
    setConnector, 
    setServiceOption,
    // Input
    input,
    updateInput,
    tags,
    setTags,
    // Run
    submit,
    status,
    // Results
    annotations, 
    batches,
    // Reset,
    clearResults,
    reset
  };
  
}