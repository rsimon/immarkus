import { LoadedImage } from '@/model';
import { useSelection } from '@annotorious/react-manifold';
import { Button } from '@/ui/Button';
import { type FileImageSnippet, getImageSnippet } from '@/utils/getImageSnippet';
import { ImageAnnotation } from '@annotorious/react';
import { useVisualSearch } from '@/pages/visualsearch/useVisualSearch';

interface VisualSearchProps {

  images: LoadedImage[];

}

export const VisualSearch = (props: VisualSearchProps) => {

  const { selected } = useSelection();

  const vs = useVisualSearch();

  const searchSimilar = () => {
    const { annotation, annotatorId } = selected[0];

    const image = props.images.find(i => i.id === annotatorId);

    console.log('running similarity search');

    getImageSnippet(
      image, 
      annotation as ImageAnnotation, 
      true, // Download IIIF
      'png'
    ).then((snippet: FileImageSnippet) => {
      const blob = new Blob([snippet.data as BlobPart], { type: 'image/png' });
      vs.index.query(blob as File).then(result => {
        console.log(result);
      })
    });
  }

  return (
    <div>
      {selected.length === 1 ? (
        <Button 
          onClick={searchSimilar}>
          Search
        </Button>
      ) : (
        <span>Select one annotation</span>
      )}
    </div>
  )

}