import { Images, ShieldAlert } from 'lucide-react';
import { Button } from '@/ui/Button';

interface IndexOutdatedProps {

}

export const IndexOutdated = (props: IndexOutdatedProps) => {

  return (
    <div className="rounded-lg relative p-6 border border-orange-200 bg-orange-50 space-y-6 max-w-2xl">
      <div className="flex gap-2 items-center text-orange-900 font-medium">
        <ShieldAlert className="size-5" />
        <p>
          Visual Search
        </p>
      </div>

      <div className="text-sm leading-relaxed text-orange-900 space-y-3">
        <p>
          With IMMARKUS Visual Search, you can find objects across your 
          images by example. Select an annotation in the annotation view
          and pick the <strong className="font-semibold"><Images className="size-3.5 inline mb-0.5" strokeWidth={2.25} /> Visual 
          Search</strong> smart tool to search for visually similar matches.
        </p>

        <p>
          Before you can use visual search, your images need to be indexed. 
          IMMARKUS analyzes your images to detect objects and make them 
          searchable – no annotations required.
        </p>
      </div>

      <div className="flex flex-col items-center mt-11 mb-6 gap-10">
        <Button
          size="lg"
          className="relative bg-orange-900 tracking-wide hover:bg-orange-900/90"
          >
          Start indexing {5} images
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

/*
  <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 text-red-600 font-medium">
              <ShieldAlert className="size-5" /> Index incomplete
            </div>

            <p className="text-sm max-w-md text-center leading-loose font-light">
              Your index is outdated. There are {count.toLocaleString()} images that need indexing.
            </p>

            <Button
              className="mt-6"
              onClick={() => setIsIndexing(true)}>
              <Cog className="size-5 mr-2" /> Indexing Missing Images
            </Button>
          </div>

*/