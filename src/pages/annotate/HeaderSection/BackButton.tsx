import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import murmur from 'murmurhash';
import { LoadedFileImage, LoadedIIIFImage, LoadedImage } from '@/model';
import { useStore } from '@/store';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { isSingleImageManifest } from '@/utils/iiif';

interface BackButtonProps {

  images: LoadedImage[];

}

const ManifestBackButton = ({ image }: { image: LoadedIIIFImage }) => {

  const store = useStore();

  const parsedManifest = useIIIFResource(image.manifestId);

  const url = useMemo(() => {
    if (!store) return;

    const resource = store.getIIIFResource(image.manifestId);
    const folder = store.getFolder(resource.folder);

    if (isSingleImageManifest(resource)) {
      return `/images/${folder && ('id' in folder) ? folder.id : ''}`;
    } else {
      if (!parsedManifest) return;

      const toc = parsedManifest.getTableOfContents();
      const node = toc.getNavParent(image.canvas.id);

      if (node) {
        const rangeId = murmur.v3(node.id);
        const canvasId = murmur.v3(image.canvas.id);
        
        return `/images/${image.manifestId}@${rangeId}?canvas=${canvasId}`;
      } else {
        // Manifest has no ToC
        return `/images/${image.manifestId}`;
      }
    }
  }, [store, parsedManifest]);

  return url ? (
    <Link className="font-semibold inline shrink-0" to={url}>
      <div className="inline-flex justify-center items-center p-1 rounded-full hover:bg-muted">
        <ChevronLeft className="size-5" />
      </div>
    </Link>
  ) : null;

}

const ImageBackButton = ({ image }: { image: LoadedFileImage }) => {

  const store = useStore();

  const url = useMemo(() => {
    if (!store) return;

    const folder = store.getFolder(image.folder);
    return `/images/${folder && ('id' in folder) ? folder.id : ''}`;
  }, [store]);

  return url ? (
    <Link className="font-semibold inline shrink-0" to={url}>
      <div className="inline-flex justify-center items-center p-1 rounded-full hover:bg-muted">
        <ChevronLeft className="size-5" />
      </div>
    </Link>
  ) : null;

}

export const BackButton = (props: BackButtonProps) => {

  return (props.images.length === 0 || props.images.length > 1) ? (
    <Link className="font-semibold inline shrink-0" to="/images/">
      <div className="inline-flex justify-center items-center p-1 rounded-full hover:bg-muted">
        <ChevronLeft className="size-5" />
      </div>
    </Link>
  ) : ('manifestId' in props.images[0]) ? (
    <ManifestBackButton image={props.images[0]} />
  ) : (
    <ImageBackButton image={props.images[0]} />
  )

}