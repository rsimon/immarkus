import murmur from 'murmurhash';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@iiif/presentation-3';
import { IIIFManifestResource } from '@/model';
import { IIIFCanvasItem } from './IIIFCanvasItem';
import { useIIIFResource } from '@/utils/iiif';

interface IIIFManifestGridProps {

  manifest: IIIFManifestResource;

}

export const IIIFManifestGrid = (props: IIIFManifestGridProps) => {

  const navigate = useNavigate();

  const parsedManifest = useIIIFResource(props.manifest.id);

  const onOpenCanvas = (canvas: Canvas) => {
    const id = murmur.v3(canvas.id);
    navigate(`/annotate/iiif:${props.manifest.id}:${id}`);
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