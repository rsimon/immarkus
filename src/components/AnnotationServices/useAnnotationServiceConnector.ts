import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EntityType, LoadedImage, RelationshipType } from '@/model';
import { useDataModel } from '@/store';
import { preprocess } from './preprocess';
import { AnnotationServiceInput, AnnotationServiceStatus } from './Types';
import { 
  AnnotationServiceConnector,
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

export const useAnnotationServiceConnector = (type: ServiceType, image: LoadedImage) => {
  const model = useDataModel();

  const [options, setOptions] = useState<AnnotationServiceOptions>({
    connectorId: ServiceRegistry.listAvailableConnectors(type)[0].id 
  });

  const [tags, setTags] = useState<EntityType[]>([]);

  const [relationTypes, setRelationTypes] = useState<RelationshipType[]>([]);

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
        const { annotations, relations } = crosswalk(data, transform, region, options.serviceOptions, model);
        return { annotations, relations, generator };
      } catch (error) {
        console.error(error);
        return { annotations: [], relations: [], generator: result.generator };
      }
    });
  }, [results, options, model]);
  
  const { annotations, relations } = useMemo(() => {
    if (!batches) return { annotations: undefined, relations: undefined };
    const annotations = batches.flatMap(b => b.annotations);
    const relations = batches.flatMap(b => b.relations);

    return { annotations, relations };
  }, [batches]);

  const submit = useCallback(() => { 
    if (!service.connector) return;

    const id = ++runId.current;
    const isStale = () => id !== runId.current;

    const onUpdateState = (state: ProcessingState) => {
      if (!isStale()) setStatus({ state });
    }

    preprocess(image, input.region, input.rotation, input.isFlipped, onUpdateState).then(result => {
      if (isStale()) return;

      onUpdateState('pending');

      const image = 'file' in result ? result.file : result.url;

      // if (typeof image === 'string')
      //   console.info('IIIF URL sent to annotation service:', image);
      // else 
      //   window.open(URL.createObjectURL(image), '_blank');

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
      
      const request = type === 'ANNOTATION'
        ? (service.connector as AnnotationServiceConnector).annotate(
            image,
            result.transform,
            options.serviceOptions,
            tags.map(tag => model.getEntityType(tag.id, true) || tag),
            relationTypes
          )
        : service.connector[OPS[type].submit](image, result.transform, options.serviceOptions, tags);

      request.then(({ data, generator }) => {
        if (isStale()) return;

        // console.log(data);

        // Test the crosswalk to make sure data is valid
        try {
          const { annotations } = crosswalk(
            data,
            result.transform, 
            submittedRegion, 
            options.serviceOptions, 
            model
          );

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
  }, [image, input, tags, relationTypes, options, service, model, type, setStatus, setResults]);

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

  // When a relationship type gets added, automatically add required entity classes 
  useEffect(() => {
    const required = new Set(
      relationTypes.flatMap(r => ([r.sourceTypeId, r.targetTypeId].filter(Boolean)))
    );

    if (required.size === 0) return;

    setTags(current => {
      const idsToAdd = [...required].filter(r => current.every(t => t.id !== r));
      if (idsToAdd.length === 0) {
        return current;
      } else {
        const tagsToAdd = idsToAdd.map(id => model.entityTypes.find(t => t.id === id)).filter(Boolean);
        return [...current, ...tagsToAdd];
      }
    });
  }, [relationTypes, model.entityTypes]);

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
    relationTypes,
    setRelationTypes,
    // Run
    submit,
    status,
    // Results
    batches,
    annotations,
    relations, 
    // Reset,
    clearResults,
    reset
  };
  
}