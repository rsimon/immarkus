import { Minus, WandSparkles } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';

interface ClickAndRefinePanelProps {

}

export const ClickAndRefinePanel = (props: ClickAndRefinePanelProps) => {

  return (
    <div>
      <ToggleGroup 
        type="single"
        defaultValue="add-mask"
        className="flex pt-5 justify-around px-2 pb-1"
        onValueChange={v => console.log(v)}>
        <div className="flex flex-col items-center gap-1">
          <ToggleGroupItem 
            value="add-mask"
            className="!rounded-full aspect-square hover:bg-muted-foreground/20 text-muted-foreground hover:text-muted-foreground data-[state=on]:border-black data-[state=on]:[&+*]:text-primary">
            <WandSparkles className="size-5" />
          </ToggleGroupItem>
          <span className="pt-1 text-muted-foreground font-medium">Select object</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <ToggleGroupItem 
            value="remove-area"
            className="!rounded-full aspect-square hover:bg-muted-foreground/20 text-muted-foreground hover:text-muted-foreground data-[state=on]:border-black data-[state=on]:[&+*]:text-primary">
            <Minus className="size-5"/>
          </ToggleGroupItem>
          <span className="pt-1 text-muted-foreground font-medium">Remove area</span>
        </div>
      </ToggleGroup>

      <p className="pt-5 px-3 text-muted-foreground font-light leading-relaxed text-center">
        Click to select an object. Add points to expand or remove areas.
      </p>
    </div>
  )

}