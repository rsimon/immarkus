import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useTransition, animated, easings } from '@react-spring/web';
import { Switch } from '@/ui/Switch';
import { Label } from '@/ui/Label';

interface GraphSettingsProps {

  onHideIsolated(checked: boolean): void;

}

export const GraphSettings = (props: GraphSettingsProps) => {

  const [open, setOpen] = useState(false);

  const transition = useTransition([open], {
    from: { width: 0, opacity: 0 },
    enter: { width: 360, opacity: 1 },
    leave: { width: 0, opacity: 0 },
    config:{
      duration: 125,
      easing: easings.easeInCubic
    }
  });

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
      <button 
        className="bg-white/80 backdrop-blur-sm text-sm text-muted-foreground hover:bg-muted py-1.5 px-3 rounded-full border border-gray-300 flex items-center justify-between"
        onClick={() => setOpen(open => !open)}>
        <span className="flex gap-2 items-center">
          <Settings className="h-4 w-4" /> Settings
        </span>

        {open && (<X className="h-3.5 w-3.5" />)}
      </button>

      {transition((style, open) => open && (
        <animated.div 
          className="content text-sm overflow-hidden bg-white/80 backdrop-blur-sm rounded"
          style={style}>
          <div className="w-[360px]">
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
        </animated.div>
      ))}
    </div>
  )

}