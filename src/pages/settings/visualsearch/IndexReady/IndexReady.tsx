import { BadgeCheck, PanelsTopLeft } from 'lucide-react';
import { VisualSearch } from '@/utils/useVisualSearch';
import { Separator } from '@/ui/Separator';
import { Button } from '@/ui/Button';

interface IndexReadyProps {

  vs: VisualSearch;

}

export const IndexReady = (props: IndexReadyProps) => {

  const { images, embeddings } = props.vs.index;

  return (
    <div className="py-1.5">
      <div className="rounded-lg relative text-sm space-y-6">
        <div className="flex gap-2 items-center font-medium">
          <BadgeCheck className="size-5" />
          <p>
            Your images are ready to search
          </p>
        </div>

        <div>
          <p className="leading-relaxed">
            IMMARKUS has successfully analyzed your images and made them searchable.
            Pick the <strong className="font-semibold">Visual Search</strong> smart 
            tool in the <strong className="font-semibold"><PanelsTopLeft className="size-3.5 inline mb-0.5" strokeWidth={2.25} /> Workspace</strong> to 
            search for visually similar matches.
          </p>
          
          <p className="text-xs text-muted-foreground mt-1">
            {images.length.toLocaleString()} images indexed · {embeddings.length.toLocaleString()} objects detected
          </p>
        </div>
      </div>

      <h2 className="mt-12 ml-px font-medium text-lg">Danger Zone</h2>
      <div className="mt-2 border border-red-400/30 rounded-md p-5">
        <section className="flex flex-col gap-4 lg:flex-row justify-between text-sm">
          <div className="leading-relaxed">
            <h3 className="font-semibold">Delete visual search index</h3>
            <p className="text-muted-foreground">
              Remove all indexed patches and embeddings. Visual search will be 
              unavailable until the index is rebuilt.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="bg-muted text-red-500 hover:text-red-600  whitespace-nowrap">
            Delete index
          </Button>
        </section>
      </div>
    </div>
  )

}