import { BadgeCheck, Images } from 'lucide-react';
import { VisualSearch } from '@/utils/useVisualSearch';

interface IndexReadyProps {

  vs: VisualSearch;

}

export const IndexReady = (props: IndexReadyProps) => {

  const { images, embeddings } = props.vs.index;

  return (
    <div className="rounded-lg relative p-6 border border-green-700/35 bg-green-600/5 space-y-6 max-w-xl">
      <div className="flex gap-2 items-center text-green-700 font-medium">
        <BadgeCheck className="size-5" />
        <p>
          Your images are ready to search
        </p>
      </div>

      <div className="text-sm leading-loose text-green-700 space-y-3">
        <p>
          IMMARKUS has analyzed your images and made them searchable.
          Pick the <strong className="font-semibold"><Images className="size-3.5 inline mb-0.5" strokeWidth={2.25} /> Visual 
          Search</strong> smart tool in the annotation view to search 
          for visually similar matches.
        </p>
      </div>

      <p className="text-xs text-green-900/60 leading-relaxed">
        {images.length.toLocaleString()} images indexed · {embeddings.length.toLocaleString()} objects detected
      </p>
    </div>
  )

}