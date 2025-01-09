import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@iiif/presentation-3';
import { IIIFManifestResource } from '@/model';
import { ToastTitle, useToast } from '@/ui/Toaster';
import { useManifestParser } from '../IIIFImporter/useManifestParser';
import { IIIFParseResult } from '../IIIFImporter/lib/Types';
import { IIIFCanvasItem } from './IIIFCanvasItem';

interface IIIFManifestGridProps {

  manifest: IIIFManifestResource;

}

export const IIIFManifestGrid = (props: IIIFManifestGridProps) => {

  const navigate = useNavigate();

  const { parse } = useManifestParser();

  const [parsedManifest, setParsedManifest] = useState<IIIFParseResult | undefined>();

  const { toast } = useToast();

  const onError = (error: string) =>
    toast({
      variant: 'destructive',
      // @ts-ignore
      title: <ToastTitle className="flex"><XCircle size={18} className="mr-2" /> Error</ToastTitle>,
      description: error
    });

  useEffect(() => {
    parse(props.manifest.uri).then(({ result, error }) => {
      if (error || !result) {
        console.error(error);
        onError(`Error parsing manifest: ${error.message}`);
      } else {
        setParsedManifest(result)
      }
    });
  }, [props.manifest]);

  const onOpenCanvas = (canvas: Canvas) => {
    console.log('annotating', props.manifest, canvas);
    // navigate(`/annotate/${canvas.id}`);
  }

  return (
    <div className="item-grid">
      {parsedManifest ? (
        <ul>
          {parsedManifest.parsed.map((canvas, idx) => (
            <li key={`${canvas.id}.${idx}`}>
              <IIIFCanvasItem
                canvas={canvas} 
                onOpen={() => onOpenCanvas(canvas)} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );

}