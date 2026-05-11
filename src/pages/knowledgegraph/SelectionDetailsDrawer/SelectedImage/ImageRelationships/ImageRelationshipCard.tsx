import { Link } from 'react-router-dom';
import { SquareArrowOutUpRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-wires-react';
import { LoadedImage } from '@/model';
import { useImages } from '@/store';
import { Button } from '@/ui/Button';
import { ImageRelationshipCardItem } from './ImageRelationshipCardItem';
import { ImageTitle } from '../../ImageTitle';

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
      className="bg-white border shadow-xs rounded">
      {loaded && (
        <>
          <div className="flex justify-between items-top p-1 pl-3 overflow-hidden">
            <ImageTitle image={loaded} />

            <Button
              asChild
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 rounded-full">
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