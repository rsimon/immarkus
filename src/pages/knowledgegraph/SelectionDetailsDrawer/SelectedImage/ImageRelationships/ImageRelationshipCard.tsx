import { Image, SquareArrowOutUpRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { LoadedImage } from '@/model';
import { useImages } from '@/store';
import { Button } from '@/ui/Button';
import { Link } from 'react-router-dom';
import { ImageRelationshipCardItem } from './ImageRelationshipCardItem';

interface ImageRelationshipCardProps {

  selectedImage: LoadedImage;
  
  otherImageId: string;

  relationships: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][];

}

export const ImageRelationshipCard = (props: ImageRelationshipCardProps) => {

  const { selectedImage, otherImageId, relationships } = props;

  const { ref, inView } = useInView();

  // Is this a card for intra-image relations?
  const isIntra = props.selectedImage.id === otherImageId;

  const loaded = isIntra ? selectedImage : useImages(inView && props.otherImageId) as LoadedImage;
  
  return (
    <article 
      ref={ref}
      className="bg-white border shadow-sm rounded">
      {loaded && (
        <>
          <div className="flex justify-between items-center p-1 pl-3">
            <h3 className="flex gap-1.5 pr-1 items-center text-xs whitespace-nowrap overflow-hidden">
              <Image className="h-3.5 w-3.5" />
              <span className="overflow-hidden text-ellipsis">{loaded.name}</span>
            </h3>

            <Button
              asChild
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0 rounded-full">
                <Link to={`/annotate/${loaded.id}`}>
                  <SquareArrowOutUpRight className="h-3.5 w-3.5" />
                </Link>
            </Button>
          </div>  

          <ul>
            {relationships.map(([link, meta]) => (
              <li key={link.id}>
                <ImageRelationshipCardItem 
                  selectedImage={selectedImage}
                  otherImage={loaded}
                  link={link}
                  meta={meta} />
              </li>
            ))}
          </ul>
        </>  
      )}
    </article>   
  )

}