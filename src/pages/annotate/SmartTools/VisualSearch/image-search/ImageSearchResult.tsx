import { ResolvedSearchResult } from './ImageSearchDialog';

interface ImageSearchResultProps {

  data: ResolvedSearchResult;

}

export const ImageSearchResult = (props: ImageSearchResultProps) => {

  const { area, bbox, imageId, image, score } = props.data;

  console.log('img', image);

  return (
    <div>
      Test
    </div>
  )

}