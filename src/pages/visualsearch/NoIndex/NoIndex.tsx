import { Images, WandSparkles } from 'lucide-react';
import { Button } from '@/ui/Button';

interface NoIndexProps {

  imageCount: number;

  onStartIndexing(): void;

}

export const NoIndex = (props: NoIndexProps) => {

  return (
    <div className="rounded-lg relative p-6 border border-orange-200 bg-orange-50 space-y-6 max-w-2xl">
      <div className="flex gap-2 items-center text-orange-900 font-medium">
        <WandSparkles className="size-5" />
        <p>
          Visual Search
        </p>
      </div>

      <div className="text-sm leading-relaxed text-orange-900 space-y-3">
        <p>
          With IMMARKUS Visual Search, you can find objects inside your 
          images based on example.
          Pick the <strong className="font-semibold"><Images className="size-3.5 inline mb-0.5" strokeWidth={2.25} /> Visual 
          Search</strong> smart tool in the annotation view, select an annotation, and find visually 
          similar matches across your collection.
        </p>

        <p>
          Before you can use visual search, your images need to be indexed. 
          IMMARKUS analyzes your images, detects objects, and makes them 
          searchable. You only need to do this once.
        </p>
      </div>

      <div className="flex flex-col items-center mt-11 mb-6 gap-10">
        <Button
          size="lg"
          className="relative bg-orange-900 tracking-wide hover:bg-orange-900/90"
          onClick={props.onStartIndexing}>
          Start indexing {props.imageCount} images
        </Button>

        <p className="text-xs text-orange-900/60 leading-relaxed text-center max-w-lg">
          Indexing runs directly in your browser and does not upload your 
          images to external services. Processing time depends on your 
          collection and computer, and may take up to a minute per image. 
        </p>
      </div>
    </div>
  )

}