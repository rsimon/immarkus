import { useEffect, useState } from 'react';
import { Image, SquareArrowOutUpRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { W3CRelationLinkAnnotation, W3CRelationMetaAnnotation } from '@annotorious/plugin-connectors-react';
import { LoadedImage } from '@/model';
import { useStore } from '@/store';
import { Button } from '@/ui/Button';
import { Link } from 'react-router-dom';
import { RelationshipCardItem } from './RelationshipCardItem';

interface RelationshipCardProps {

  selectedImage: LoadedImage;
  
  otherImageId: string;

  relationships: [W3CRelationLinkAnnotation, W3CRelationMetaAnnotation][];

}

export const RelationshipCard = (props: RelationshipCardProps) => {

  const { selectedImage, otherImageId, relationships } = props;

  const store = useStore();

  const { ref, inView } = useInView();

  // Is this a card for intra-image relations?
  const isIntra = props.selectedImage.id === otherImageId;

  const [loadedImage, setLoadedImage] = useState<LoadedImage>(isIntra ? selectedImage : undefined);

  useEffect(() => {
    if (!inView || isIntra) return;

    store.loadImage(props.otherImageId).then(setLoadedImage);
  }, [inView, isIntra, props.otherImageId]);

  return (
    <article 
      ref={ref}
      className="bg-white border shadow-sm rounded">
      {loadedImage && (
        <>
          <div className="flex justify-between items-center p-1 pl-3">
            <h3 className="flex gap-1.5 pr-1 items-center text-xs whitespace-nowrap overflow-hidden">
              <Image className="h-3.5 w-3.5" />
              <span className="overflow-hidden text-ellipsis">{loadedImage.name}</span>
            </h3>

            <Button
              asChild
              size="icon"
              variant="ghost"
              className="h-8 w-8 flex-shrink-0">
                <Link to={`/annotate/${loadedImage.id}`}>
                  <SquareArrowOutUpRight className="h-3.5 w-3.5" />
                </Link>
            </Button>
          </div>  

          <ul>
            {relationships.map(([link, meta]) => (
              <li key={link.id}>
                <RelationshipCardItem 
                  selectedImage={selectedImage}
                  otherImage={loadedImage}
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