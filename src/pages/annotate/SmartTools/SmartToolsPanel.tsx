import { useCallback, useEffect, useRef, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import { FlaskConical, Grip, Magnet, ScanText, ScissorsLineDashed, Sparkles, X } from 'lucide-react';
import { LoadedImage } from '@/model';
import { Button } from '@/ui/Button';
import { AnnotationMode, Tool } from '../AnnotationMode';
import { AutoSelect } from './AutoSelect';
import { EdgeSnap } from './EdgeSnap';
import { SmartScissors } from './SmartScissors';
import { Transcribe } from './Transcribe';
import { SAMInitializing } from './SAMInitializing';
import { useSAMPlugin } from './useSAMPlugin';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';

interface SmartToolsPanelProps {

  images: LoadedImage[];

  mode?: AnnotationMode;

  tool: Tool;

  onChangeMode(mode?: AnnotationMode): void;

  onChangeTool(tool: Tool): void;

  onClosePanel(): void;

}

type SmartTool = 'auto-select' | 'edge-snap' | 'smart-scissors' | 'transcribe'; 

export const SmartToolsPanel = (props: SmartToolsPanelProps) => {

  const el = useRef(null);

  const pluginRunning = useRef(false);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [tab, setTab] = useState<SmartTool>('smart-scissors');

  const { 
    plugin, 
    initialized, 
    downloading,
    downloadProgress,
    busy, 
    error 
  } = useSAMPlugin();

  useEffect(() => {
    // Not sure why this is needed since neodrag v2.3...
    setTimeout(() => el.current.style.translate = null, 0);
  }, []);

  useEffect(() => {
    if (!plugin) return;

    const stopPluginIfRunning = () => {
      if (pluginRunning.current) {
        plugin.stop();
        pluginRunning.current = false;
      }
    }

    if (tab === 'edge-snap') {
      stopPluginIfRunning();
      props.onChangeTool('magnetic-cursor');
      props.onChangeMode('draw');
    } else if (tab === 'smart-scissors') {
      props.onChangeTool('intelligent-scissors');
      props.onChangeMode('draw');
    } else if (tab === 'transcribe') {
      stopPluginIfRunning();
      props.onChangeMode(undefined);
    } else {
      pluginRunning.current = true;
      props.onChangeMode(undefined);
    }
  }, [plugin, tab]);

  useEffect(() => {
    if (!plugin?.destroy) return;

    return () => {
      plugin.destroy();
    }
  }, [plugin]);

  useDraggable(el, {
    position,
    handle: '.drag-handle',
    onDrag: ({ offsetX, offsetY }) => setPosition({ x: offsetX, y: offsetY })
  });

  const onSetSAMEnabled = useCallback((enabled: boolean) => {
    props.onChangeMode(enabled ? undefined : 'move');
  }, []);

  const onSetToolEnabled = useCallback((tool: Tool, enabled: boolean) => {
    if (enabled) {
      props.onChangeMode('draw');
      props.onChangeTool(tool);
    } else {
      props.onChangeMode('move');
    }
  }, []);

  return (
    <div
      ref={el}
      className="bg-white absolute w-64 top-14 -right-24 border rounded overflow-hidden shadow-lg z-30">

      <div className="flex items-center justify-between gap-1.5 text-xs font-semibold py-1 px-2 border-b border-stone-200 cursor-grab drag-handle">
        <div className="flex items-center gap-1.5">
          <Grip className="size-4" />
          <span>Smart Tools</span>
        </div>

        <Button
          variant="ghost"
          className="p-1 h-auto -mr-1"
          onClick={props.onClosePanel}>
          <X className="size-4" />
        </Button>
      </div>

      {('gpu' in navigator && !error) ? (
        <Accordion 
          type="single"
          value={tab}
          onValueChange={tab => setTab(tab as SmartTool)}>
          <AccordionItem value="smart-scissors" className="border-b-0">
            <AccordionTrigger 
              className="text-xs font-normal hover:no-underline overflow-hidden p-2 gap-2 justify-start">
              <span className="flex grow items-center gap-2 justify-start">
                <ScissorsLineDashed className="size-4" /> Smart Scissors
              </span>
            </AccordionTrigger>

            <AccordionContent className="bg-stone-700/5 border-t border-stone-200 text-xs pt-0" >
              <SmartScissors 
                enabled={props.mode === 'draw' && props.tool === 'intelligent-scissors'} 
                onSetEnabled={enabled => onSetToolEnabled('intelligent-scissors', enabled)} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="edge-snap" className="border-b-0">
            <AccordionTrigger 
              className="text-xs font-normal border-t hover:no-underline overflow-hidden p-2 gap-2 justify-start">
              <span className="flex grow items-center gap-2 justify-start">
                <Magnet className="size-4" /> Edge Snap
              </span>
            </AccordionTrigger>

            <AccordionContent className="bg-stone-700/5 border-t border-stone-200 text-xs pt-0" >
              <EdgeSnap 
                enabled={props.mode === 'draw' && props.tool === 'magnetic-cursor'}
                onSetEnabled={enabled => onSetToolEnabled('magnetic-cursor', enabled)} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="auto-select" className="border-b-0">
            <AccordionTrigger 
              className="text-xs font-normal border-t hover:no-underline overflow-hidden p-2">
              <span className="flex grow items-center gap-2 justify-start">
                <Sparkles className="size-4" /> Auto Select
              </span>
            </AccordionTrigger>

            <AccordionContent className="bg-stone-700/5 border-stone-200 border-t text-xs pt-0" asChild>
              {initialized ? (
                <AutoSelect 
                  plugin={plugin}
                  busy={busy}
                  enabled={!props.mode} 
                  onSetEnabled={onSetSAMEnabled} />
              ) : (
                <SAMInitializing
                  plugin={plugin}
                  downloading={downloading}
                  progress={downloadProgress} />
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="transcribe" className="border-b-0">
            <AccordionTrigger 
              className="text-xs font-normal border-t hover:no-underline overflow-hidden p-2">
              <span className="flex grow items-center gap-2 justify-start">
                <ScanText className="size-4" /> Auto Transcribe
              </span>
            </AccordionTrigger>

            <AccordionContent className="bg-stone-700/5 border-stone-200 border-t text-xs pt-0" asChild>
              <Transcribe 
                images={props.images} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="p-5">
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="bg-orange-400 rounded-full text-white p-2">
              <FlaskConical className="size-5" />
            </div>

            <div className="text font-medium text-orange-400">
              Not Supported
            </div>

            <p className="pt-4 text-xs text-muted-foreground font-light leading-relaxed">
              Smart selection uses experimental WebGPU technology not 
              available in your browser. Please switch to a recent version 
              of Chrome or Edge to use this 
              feature. <a 
                className="underline text-slate-800"
                href="https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API#browser_compatibility" target="_blank">View browser compatibility</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  )

}