import { IIIFManifestResource } from '@/model';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/ui/Tabs';
import { CozyMetadata } from '@/utils/cozy-iiif';
import { useIIIFResource } from '@/utils/iiif/hooks';
import { useMemo, useState } from 'react';
import { CanvasGridItem } from '../Types';
import { NotebookPen, PenOff } from 'lucide-react';

const MetadataList = ({ metadata } : { metadata?: CozyMetadata[] }) => {

  const [tab, setTab] = useState<string>('custom'); 

  return (
    <Tabs 
      value={tab}
      onValueChange={setTab}
      className="p-2.5 h-full flex flex-col">
      <TabsList className="gap-2 bg-transparent justify-start">
        <TabsTrigger 
          value="custom" 
          className="flex gap-1 transition-none px-2.5 py-1.5 pr-3 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white">
          <NotebookPen size={15} className="mx-1" /> My Metadata
        </TabsTrigger>

        <TabsTrigger 
          value="embedded" 
          className={`flex gap-1 transition-none pl-2 ${tab === 'metadata' ? 'pr-3' : 'pr-2'} py-1.5 border font-normal bg-muted/50 text-xs rounded-full data-[state=active]:bg-black data-[state=active]:border-black data-[state=active]:font-normal data-[state=active]:text-white`}>
          <PenOff size={15} className="mx-1" />IIIF
        </TabsTrigger>
      </TabsList>

      <TabsContent 
        value="embedded"
        className="flex-grow">
        {metadata ? (
          metadata.length > 0 ? (
            <ul className="h-full space-y-4 text-sm leading-relaxed py-2 px-2.5">
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
              No IIIF Metadata
            </div>
          )
        ) : null}
      </TabsContent>
    </Tabs>
  )

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