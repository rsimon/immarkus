import { useStore } from '@/store';
import { useAnnotoriousManifold } from '@annotorious/react-manifold';
import { ImageMetadataSection } from './ImageMetadataSection';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';

export const ImageMetadata = () => {

  const anno = useAnnotoriousManifold();

  const store = useStore();

  const images = anno.sources.map(source => 
    source.startsWith('iiif:') ? store.getCanvas(source) : store.getImage(source));

  return images.length === 1 ? (
    <div className="flex-grow justify-start h-full flex flex-col text-sm items-center w-full p-3 px-4">
      <ImageMetadataSection image={images[0]} />
    </div>
  ) : (
    <div className="px-4 py-2 text-sm w-full relative">
      <Accordion
        type="multiple"
        className="w-full">
        {images.map(image => (
          <AccordionItem key={image.id} value={image.id} className="border-b w-full overflow-hidden relative">
            <AccordionTrigger className="text-xs font-medium w-full overflow-hidden text-ellipsis">
              <div className="whitespace-nowrap overflow-hidden pr-1 text-ellipsis">{image.name}</div>
            </AccordionTrigger>

            <AccordionContent>
              <ImageMetadataSection image={image} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )

}