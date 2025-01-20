import { IIIFManifestResource } from '@/model';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { useEffect } from 'react';

interface IIIFMetadataPanelProps {

  manifest: IIIFManifestResource;

}

export const IIIFMetadataPanel = (props: IIIFMetadataPanelProps) => {

  const manifest = useIIIFResource(props.manifest.id);

  useEffect(() => {
    console.log(manifest);
  }, [manifest]);

  return null;

}