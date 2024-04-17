import { useTransition, animated, easings } from '@react-spring/web';
import { Button } from '@/ui/Button';
import { Label } from '@/ui/Label';
import { Switch } from '@/ui/Switch';
import { GraphSettings } from '../Types';
import { Microscope } from 'lucide-react';

interface SettingsPanelProps {

  isQueryBuildOpen: boolean;

  open: boolean;

  settings: GraphSettings;

  onChangeSettings(changed: GraphSettings): void;

  onToggleQueryBuilder(): void;

}

export const SettingsPanel = (props: SettingsPanelProps) => {

  const transition = useTransition([props.open], {
    from: {  transform: 'translateY(50%)', opacity: 0 },
    enter: { transform: 'translateY(0%)', opacity: 1 },
    leave: { transform: 'translateY(50%)', opacity: 0 },
    config:{
      duration: 125,
      easing: easings.easeOutCubic
    }
  });

  return transition((style, open) => open && (
    <animated.div 
      className="bg-white/80 backdrop-blur-sm text-sm overflow-y-auto rounded 
        border pointer-events-auto shadow grow-0 shrink-0 basis-auto"
      style={style}>
      <div className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <Label htmlFor="hide-labels">
            Hide labels
          </Label>

          <Switch 
            checked={props.settings.hideLabels}
            id="hide-labels"
            onCheckedChange={checked => 
              props.onChangeSettings({...props.settings, hideLabels: checked})} />
        </div>

        <p className="text-muted-foreground text-xs mt-1 pr-12">
          Don't show text labels for graph nodes. A hover tooltip
          will be used instead.
        </p>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <Label htmlFor="include-folders">
            Show sub-folders as nodes
          </Label>

          <Switch 
            checked={props.settings.includeFolders}
            id="include-folders"
            onCheckedChange={checked => 
              props.onChangeSettings({...props.settings, includeFolders: checked})} />
        </div>

        <p className="text-muted-foreground text-xs mt-1 pr-12">
          Include sub-folders inside your workfolder as nodes in the graph.
        </p>
      </div>

      <div className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <Label htmlFor="hide-isolated">
            Hide unconnected nodes
          </Label>

          <Switch 
            id="hide-isolated" 
            checked={props.settings.hideIsolatedNodes}
            onCheckedChange={checked => 
              props.onChangeSettings({...props.settings, hideIsolatedNodes: checked})} />
        </div>

        <p className="text-muted-foreground text-xs mt-1 pr-12">
          Remove unused entity classes and images without entity annotations from the graph.
        </p>
      </div>

      <div className="px-3 pt-6 pb-4">
        <Button 
          className="w-full"
          variant={props.isQueryBuildOpen ? 'outline' : undefined}
          onClick={props.onToggleQueryBuilder}>
          <Microscope className="h-5 w-5 mr-2" />
          {props.isQueryBuildOpen ? 'Close Query Builder' : 'Open Query Builder'}
        </Button>
      </div>
    </animated.div>
  ))

}