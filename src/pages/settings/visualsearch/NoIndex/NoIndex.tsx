import { ChevronDown, PanelsTopLeft } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/Collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/Select';

interface NoIndexProps {

  imageCount: number;

  availableSegmenters: string[];

  selectedSegmenter: string;

  onStartIndexing(): void;

  onChangeSegmenter(url?: string): void;

}

const getModelName = (url: string) =>
  url.split('/').pop()?.replace(/\.onnx$/, '') ?? '';

export const NoIndex = (props: NoIndexProps) => {

  return (
    <div className="text-sm">    
      <div className="leading-relaxed space-y-3 mt-6 font-light">
        <p>
          With IMMARKUS Visual Search, you can find objects inside your 
          images based on example.
          Pick the <strong className="font-semibold">Visual Search</strong> smart tool 
          in the <strong className="font-semibold"><PanelsTopLeft className="size-3.5 inline mb-0.5" strokeWidth={2.25} /> Workspace</strong>, select 
          an annotation, and find visually similar matches across your collection.
        </p>

        <p>
          Before you can use visual search, your images need to be indexed. 
          IMMARKUS analyzes your images, detects objects, and makes them 
          searchable. You only need to do this once.
        </p>
      </div>

      <div className="flex flex-col mt-11 mb-2 gap-8">
        <div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => props.onStartIndexing()}>
            Start indexing {props.imageCount} images
          </Button>

          {props.availableSegmenters.length > 1 && (
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="link" className="px-0.5 mt-1 font-light group w-full flex justify-start gap-1">
                  Advanced Options
                  <ChevronDown 
                    className="size-4 group-data-[state=open]:rotate-180"/>
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="rounded-md bg-muted p-4 text-xs">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="sm:self-center space-y-1">
                    <p className="font-medium text-foreground">Segmentation model</p>
                    <p className="text-muted-foreground">
                      Controls how images are divided into searchable regions
                    </p>
                  </div>

                  <Select 
                    value={props.selectedSegmenter} 
                    onValueChange={props.onChangeSegmenter}>
                    <SelectTrigger className="w-full bg-background gap-1">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      {props.availableSegmenters.map(url => (
                        <SelectItem key={url} value={url}>
                          {getModelName(url)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <p className="text-xs font-light text-muted-foreground leading-relaxed">
          Indexing runs directly in your browser and does not upload your 
          images to external services. Processing time depends on your 
          collection and computer, and may take up to a minute per image. 
        </p>
      </div>
    </div>
  )

}