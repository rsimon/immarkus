import { useMemo } from 'react';
import { VisualSearch } from '@/utils/useVisualSearch';
import { BadgeCheck } from 'lucide-react';

interface IndexReadyProps {

  vs: VisualSearch;

}

export const IndexReady = (props: IndexReadyProps) => {

  const { images, embeddings } = props.vs.index;

  const segments = useMemo(() => 
    images.flatMap(i => i.segments).length, [images]);

  return (
    <div className="border border-green-700 p-4 rounded space-y-2">
      <div className="flex gap-2 items-start text-green-700 font-medium">
        <BadgeCheck className="size-5" strokeWidth={2.25}/>
        <p>
          Your work folder is ready for visual search.
        </p>
      </div>

      <p className="text-muted-foreground text-sm">
        The images in your collection are indexed for visual search. You can 
      </p>
      <ul>
        <li>{images.length.toLocaleString()} images</li>
        <li>{embeddings.length.toLocaleString()} embedding vectors</li>
        <li>{segments.toLocaleString()} segments</li>
      </ul>
    </div>
  )

}