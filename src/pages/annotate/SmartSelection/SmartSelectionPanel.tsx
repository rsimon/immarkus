import { useCallback, useEffect, useRef, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import { FlaskConical, Grip, Magnet, Scissors, SquareDashedMousePointer, X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { AnnotationMode, Tool } from '../AnnotationMode';
import { DetectObjectsSection, MagneticCursorSection, SmartScissorsSection } from './sections';
import { SAMInitializing } from './SAMInitializing';
import { useSAMPlugin } from './useSAMPlugin';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';


interface SmartSelectionProps {

  mode: AnnotationMode;

  onChangeMode(mode: AnnotationMode): void;

  onChangeTool(tool: Tool): void;

  onClosePanel(): void;

}

export const SmartSelectionPanel = (props: SmartSelectionProps) => {

  const el = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  const [tab, setTab] = useState('magnetic-cursor');

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

    if (tab !== 'click-and-refine')
      plugin.stop();
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

  const onSetEnabled = useCallback((enabled: boolean) => {
    props.onChangeMode(enabled ? 'smart' : 'move');
  }, []);

  return (
    <div
      ref={el}
      className="bg-white absolute w-64 top-14 -right-24 border rounded overflow-hidden shadow-lg z-30">

      <div className="flex items-center justify-between gap-1.5 text-xs font-semibold py-1 px-2 border-b border-stone-200 cursor-grab drag-handle">
        <div className="flex items-center gap-1.5">
          <Grip className="size-4" />
          <span>Smart Selection</span>
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
          onValueChange={setTab}>
          <AccordionItem value="magnetic-cursor" className="border-b-0">
            <AccordionTrigger 
              className="text-xs font-normal hover:no-underline overflow-hidden p-2 gap-2 justify-start">
              <span className="flex grow items-center gap-2 justify-start">
                <Magnet className="size-4" /> Magnetic Cursor
              </span>
            </AccordionTrigger>

            <AccordionContent className="bg-stone-700/5 border-t border-stone-200 text-xs pt-0" >
              <MagneticCursorSection 
                onChangeMode={props.onChangeMode}
                onChangeTool={props.onChangeTool} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="smart-scissors" className="border-b-0">
            <AccordionTrigger 
              className="text-xs font-normal border-t hover:no-underline overflow-hidden p-2 gap-2 justify-start">
              <span className="flex grow items-center gap-2 justify-start">
                <Scissors className="size-4" /> Smart Scissors
              </span>
            </AccordionTrigger>

            <AccordionContent className="bg-stone-700/5 border-t border-stone-200 text-xs pt-0" >
              <SmartScissorsSection 
                onChangeMode={props.onChangeMode}
                onChangeTool={props.onChangeTool} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="detect-objects" className="border-b-0">
            <AccordionTrigger 
              className="text-xs font-normal border-t hover:no-underline overflow-hidden p-2">
              <span className="flex grow items-center gap-2 justify-start">
                <SquareDashedMousePointer className="size-4" /> Click and Refine
              </span>
            </AccordionTrigger>

            <AccordionContent className="bg-stone-700/5 border-stone-200 border-t text-xs pt-0" asChild>
              {initialized ? (
                <DetectObjectsSection 
                  plugin={plugin}
                  busy={busy}
                  enabled={props.mode === 'smart'} 
                  onSetEnabled={onSetEnabled} />
              ) : (
                <SAMInitializing
                  plugin={plugin}
                  downloading={downloading}
                  progress={downloadProgress} />
              )}
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