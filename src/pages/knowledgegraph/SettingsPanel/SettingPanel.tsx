import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { useTransition, animated, easings } from '@react-spring/web';
import { Switch } from '@/ui/Switch';
import { Label } from '@/ui/Label';
import { GraphSettings } from '../Types';

interface SettingsPanelProps {

  settings: GraphSettings;

  onChangeSettings(changed: GraphSettings): void;

}

export const SettingsPanel = (props: SettingsPanelProps) => {

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
        className="bg-white/80 backdrop-blur-sm text-sm text-muted-foreground hover:bg-muted py-1.5 px-3 rounded-full border border-gray-200 flex items-center justify-between"
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
                  checked={props.settings.hideIsolatedNodes}
                  onCheckedChange={checked => 
                    props.onChangeSettings({...props.settings, hideIsolatedNodes: checked})} />
              </div>

              <p className="text-muted-foreground text-xs mt-1 pr-12">
                Remove unused entity classes and images without entity annotations from the graph.
              </p>
            </div>

            <div className="p-3">
            <div className="flex items-center gap-2 justify-between">
                <Label htmlFor="show-isolated">
                  Hide labels
                </Label>

                <Switch 
                  checked={props.settings.hideLabels}
                  id="display-labels"
                  onCheckedChange={checked => 
                    props.onChangeSettings({...props.settings, hideLabels: checked})} />
              </div>

              <p className="text-muted-foreground text-xs mt-1 pr-12">
                Don't show text labels for graph nodes.
              </p>
            </div>
          </div>
        </animated.div>
      ))}
    </div>
  )

}