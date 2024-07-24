import { useTransition, animated, easings } from '@react-spring/web';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/ui/Collapsible';
import { Label } from '@/ui/Label';
import { RadioGroup, RadioGroupItem } from '@/ui/RadioGroup';
import { Switch } from '@/ui/Switch';
import { KnowledgeGraphSettings } from '../Types';
import { Separator } from '@/ui/Separator';

import { useState } from 'react';

interface SettingsPanelProps {

  open: boolean;

  settings: KnowledgeGraphSettings;

  onChangeSettings(changed: KnowledgeGraphSettings): void;

}

export const SettingsPanel = (props: SettingsPanelProps) => {

  const { settings } = props;  

  const transition = useTransition([props.open], {
    from: {  transform: 'translateY(50%)', opacity: 0 },
    enter: { transform: 'translateY(0%)', opacity: 1 },
    leave: { transform: 'translateY(50%)', opacity: 0 },
    config:{
      duration: 125,
      easing: easings.easeOutCubic
    }
  });

  const [typeLabelsOpen, setTypeLabelsOpen] = useState(false);

  const onToggleAllLabels = (hidden: boolean) =>
    props.onChangeSettings({
      ...settings, 
      hideAllLabels: hidden, 
      hideNodeTypeLabels: undefined 
    });

  const onToggleTypeLabel = (type: string, hidden: boolean) => {
    const currentHidden = (settings.hideNodeTypeLabels || []);
    const max = settings.includeFolders ? 3 : 2;

    if (hidden) {
      const nextHidden = Array.from(new Set([...currentHidden, type]));
      if (nextHidden.length === max) {
        // Hide all
        props.onChangeSettings({
          ...settings,
          hideAllLabels: true,
          hideNodeTypeLabels: undefined
        });
      } else if (nextHidden.length === 0) {
        // Hide none
        props.onChangeSettings({
          ...settings,
          hideAllLabels: false,
          hideNodeTypeLabels: undefined
        });
      } else {
        // Hide current selection
        props.onChangeSettings({
          ...settings,
          hideAllLabels: false,
          hideNodeTypeLabels: nextHidden as ('FOLDER' | 'IMAGE' | 'ENTITY_TYPE')[]
        });
      }
    } else {
      const nextHidden = currentHidden.filter(t => t !== type);
      if (nextHidden.length === 0) {
        props.onChangeSettings({
          ...settings,
          hideAllLabels: false,
          hideNodeTypeLabels: undefined
        });
      } else if (nextHidden.length === max) {
        // Shouldn't really happen, but for completeness
        props.onChangeSettings({
          ...settings,
          hideAllLabels: true,
          hideNodeTypeLabels: undefined
        });
      } else {
        props.onChangeSettings({
          ...settings,
          hideAllLabels: false,
          hideNodeTypeLabels: nextHidden
        });
      }
    } 
  }

  const isTypeLabelHidden = (type: string) => {
    if (settings.hideAllLabels) return true;

    return (settings.hideNodeTypeLabels || []).includes(type as ('FOLDER' | 'IMAGE' | 'ENTITY_TYPE'));
  }

  return transition((style, open) => open && (
    <animated.div 
      className="bg-white/80 backdrop-blur-sm text-sm overflow-y-auto rounded 
        border pointer-events-auto shadow grow-0 shrink-0 basis-auto"
      style={style}>
      <fieldset className="p-3">
        <div className="pb-3">
          <legend>
            <div className="font-medium">Graph Display Mode</div> 
            <p className="text-muted-foreground text-xs mt-0.5">
              Select how graph nodes should be linked. 
            </p>
          </legend>
        </div>

        <RadioGroup 
          value={settings.graphMode} 
          onValueChange={(graphMode: 'HIERARCHY' | 'RELATIONS') => props.onChangeSettings({...settings, graphMode })}>
          <div className="flex items-start gap-3 pl-1">
            <RadioGroupItem 
              className="mt-[2px] flex-shrink-0"
              value="HIERARCHY" 
              id="HIERARCHY" />

            <div>
              <Label htmlFor="HIERARCHY">Hierarchy</Label>
              <p className="text-xs text-muted-foreground">
                Based on data model, folder hierarchy and entity annotations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pl-1">
            <RadioGroupItem 
              className="mt-[2px] flex-shrink-0"
              value="RELATIONS" 
              id="RELATIONS" />

            <div>
              <Label htmlFor="RELATIONS">Relations</Label>
              <p className="text-xs text-muted-foreground">
                Links are based on Relations. Hierarchy links are shown on hover.
              </p>
            </div>
          </div>
        </RadioGroup>
      </fieldset>

      <div className="px-3 py-1.5"><Separator /></div>

      <fieldset className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <Label htmlFor="hide-labels">
            Hide labels
          </Label>

          <Switch 
            checked={settings.hideAllLabels}
            id="hide-labels"
            onCheckedChange={onToggleAllLabels} />
        </div>

        <p className="text-muted-foreground text-xs mt-1 pr-12">
          Don't show text labels for graph nodes. A hover tooltip
          will be used instead.
        </p>

        <Collapsible onOpenChange={open => setTypeLabelsOpen(open)}>
          <CollapsibleTrigger className="flex items-center gap-0.5 font-medium text-xs mt-1.5">
            {typeLabelsOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )} Hide for specific node types
          </CollapsibleTrigger>

          <CollapsibleContent className="pl-4">
            <div className="flex items-center gap-2 justify-between mt-1">
              <Label 
                className="text-xs font-normal"
                htmlFor="hide-image-labels">
                Image labels
              </Label>

              <Switch 
                checked={isTypeLabelHidden('IMAGE')}
                id="hide-image-labels"
                onCheckedChange={checked => onToggleTypeLabel('IMAGE', checked)} />
            </div>

            {settings.includeFolders && (
              <div className="flex items-center gap-2 justify-between mt-1.5">
                <Label 
                  className="text-xs font-normal"
                  htmlFor="hide-folder-labels">
                  Sub-folder labels
                </Label>

                <Switch 
                  checked={isTypeLabelHidden('FOLDER')}
                  id="hide-folder-labels"
                  onCheckedChange={checked => onToggleTypeLabel('FOLDER', checked)} />
              </div>
            )}

            <div className="flex items-center gap-2 justify-between mt-1.5">
              <Label 
                className="text-xs font-normal"
                htmlFor="hide-entity-labels">
                Entity class labels
              </Label>

              <Switch 
                checked={isTypeLabelHidden('ENTITY_TYPE')}
                id="hide-entity-labels"
                onCheckedChange={checked => onToggleTypeLabel('ENTITY_TYPE', checked)} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </fieldset>

      <fieldset className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <Label htmlFor="include-folders">
            Show sub-folders as nodes
          </Label>

          <Switch 
            checked={settings.includeFolders}
            id="include-folders"
            onCheckedChange={checked => 
              props.onChangeSettings({...settings, includeFolders: checked})} />
        </div>

        <p className="text-muted-foreground text-xs mt-1 pr-12">
          Include sub-folders inside your workfolder as nodes in the graph.
        </p>
      </fieldset>

      <fieldset className="p-3">
        <div className="flex items-center gap-2 justify-between">
          <Label htmlFor="hide-isolated">
            Hide unconnected nodes
          </Label>

          <Switch 
            id="hide-isolated" 
            checked={settings.hideIsolatedNodes}
            onCheckedChange={checked => 
              props.onChangeSettings({...settings, hideIsolatedNodes: checked})} />
        </div>

        <p className="text-muted-foreground text-xs mt-1 pr-12">
          Remove nodes without any connections from the graph.
        </p>
      </fieldset>
    </animated.div>
  ))

}