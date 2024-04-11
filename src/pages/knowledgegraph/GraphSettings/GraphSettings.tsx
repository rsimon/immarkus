import { useState } from 'react';
import { Settings } from 'lucide-react';
import { Switch } from '@/ui/Switch';
import { Label } from '@/ui/Label';

interface GraphSettingsProps {

  onHideIsolated(checked: boolean): void;

}

export const GraphSettings = (props: GraphSettingsProps) => {

  const [open, setOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm z-20">
      <button className="trigger text-sm hover:bg-muted py-1.5 pl-3 pr-4 rounded-full border border-gray-300 flex gap-2 items-center text-muted-foreground"
        onClick={() => setOpen(open => !open)}>
        <Settings className="h-4 w-4" /> Settings
      </button>

      {open && (
        <div className="content w-[360px] border border-red-100 text-sm">
          <div className="p-3">
            <div className="flex items-center gap-2 justify-between">
              <Label htmlFor="show-isolated">
                Hide unconnected nodes
              </Label>

              <Switch 
                id="show-isolated" 
                onCheckedChange={props.onHideIsolated} />
            </div>

            <p className="text-muted-foreground text-xs mt-1 pr-12">
              Removes unused entity classes and images without entity annotations from the graph.
            </p>
          </div>

          <div className="p-3">
          <div className="flex items-center gap-2 justify-between">
              <Label htmlFor="show-isolated">
                Display text labels
              </Label>

              <Switch 
                id="display-labels" />
            </div>

            <p className="text-muted-foreground text-xs mt-1 pr-12">
              Show text labels for image and entity classes.
            </p>
          </div>
        </div>
      )}
    </div>
  )

}