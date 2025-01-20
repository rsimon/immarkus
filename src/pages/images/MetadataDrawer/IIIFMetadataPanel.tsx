import { IIIFManifestResource } from '@/model';
import { CozyMetadata } from '@/utils/cozy-iiif';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { useMemo } from 'react';
import { CanvasGridItem } from '../Types';

const MetadataList = ({ metadata } : { metadata?: CozyMetadata[] }) => {

  return metadata ? (
    metadata.length > 0 ? (
      <ul className="h-full pt-8 pb-4 px-6 space-y-4 text-sm leading-relaxed">
        {metadata.map(({ label, value }, index) => (
          <li key={`${label}:${index}`}>
            <div 
              className="font-semibold">
              {label}
            </div>
            
            <div 
              className="pl-4 [&_a]:text-sky-700 [&_a]:hover:underline"
              dangerouslySetInnerHTML={{ __html: value || '' }} />
          </li>
        ))}
      </ul>
    ) : (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        No Metadata
      </div>
    )
  ) : null;

}


export const IIIFManifestMetadataPanel = ({ item }: { item: IIIFManifestResource }) => {

  const manifest = useIIIFResource(item.id);

  const metadata = useMemo(() => {
    if (!manifest) return;
    return manifest.getMetadata();
  }, [manifest]);

  return (
    <MetadataList metadata={metadata} />
  )

}

export const IIIFCanvasMetadataPanel = ({ item }: { item: CanvasGridItem }) => {

  return (
    <MetadataList metadata={item.canvas.getMetadata()} />
  )

}