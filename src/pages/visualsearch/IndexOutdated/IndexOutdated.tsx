import { Images, ShieldAlert } from 'lucide-react';
import { Button } from '@/ui/Button';

interface IndexOutdatedProps {

}

export const IndexOutdated = (props: IndexOutdatedProps) => {

  return (
    <div className="rounded-lg relative p-6 border border-red-700/30 bg-red-700/5 space-y-6 max-w-2xl">
      <div className="flex gap-2 items-center text-red-700 font-medium">
        <ShieldAlert className="size-5" />
        <p>
          Your index is out of date
        </p>
      </div>

      <div className="text-sm leading-relaxed text-red-700 space-y-3">
        <p>
          Your image collection has changed since the last indexing run. Update the 
          index to include new or modified images in visual search.
        </p>
      </div>

      <div className="flex flex-col items-center mt-11 mb-6 gap-10">
        <Button
          size="lg"
          variant="outline"
          className="relative border-red-700/30 bg-red-700/90 hover:bg-red-700/80 tracking-wide text-white hover:text-white"
          >
          Index new images
        </Button>

        <p className="text-xs text-red-800/60 leading-relaxed text-center max-w-lg">
          Visual search only includes indexed images until you update. Processing time depends on your 
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