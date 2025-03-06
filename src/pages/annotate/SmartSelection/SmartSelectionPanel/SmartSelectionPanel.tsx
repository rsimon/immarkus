import { useCallback, useEffect, useRef, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import { Grip, Magnet, SquareDashedMousePointer, SquareSquare, X } from 'lucide-react';
import { AnnotationMode } from '../../AnnotationMode';
import { BoxSection, ClickAndRefineSection, MagneticOutlineSection } from './sections';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';
import { Button } from '@/ui/Button';

interface SmartSelectionProps {

  mode: AnnotationMode;

  onChangeMode(mode: AnnotationMode): void;

  onClosePanel(): void;

}

export const SmartSelectionPanel = (props: SmartSelectionProps) => {

  const el = useRef(null);

  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Not sure why this is needed since neodrag v2.3...
    setTimeout(() => el.current.style.translate = null, 0);
  }, []);

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
      className="bg-white absolute w-64 top-14 -right-24 rounded border shadow-lg z-30">

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
      
      <Accordion 
        type="single"
        defaultValue="click-and-refine">
        <AccordionItem value="click-and-refine" defaultChecked={true}>
          <AccordionTrigger 
            className="text-xs font-normal hover:no-underline overflow-hidden p-2">
            <span className="flex grow items-center gap-2 justify-start">
              <SquareDashedMousePointer className="size-4" /> Click and Refine
            </span>
          </AccordionTrigger>

          <AccordionContent className="bg-stone-700/5 border-stone-200 border-t text-xs pt-0" asChild>
            <ClickAndRefineSection 
              enabled={props.mode === 'smart'} 
              onSetEnabled={onSetEnabled} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="box">
          <AccordionTrigger 
            className="text-xs font-normal hover:no-underline overflow-hidden p-2 gap-2 justify-start">
            <span className="flex grow items-center gap-2 justify-start">
              <SquareSquare className="size-4"/> Box
            </span>
          </AccordionTrigger>

          <AccordionContent className="bg-muted border-t border-stone-200 text-xs pt-0" >
            <BoxSection />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="magnetic-outline" className="border-b-0">
          <AccordionTrigger 
            className="text-xs font-normal hover:no-underline overflow-hidden p-2 gap-2 justify-start">
            <span className="flex grow items-center gap-2 justify-start">
              <Magnet className="size-4" /> Magnetic Outline
            </span>
          </AccordionTrigger>

          <AccordionContent className="bg-muted border-t border-stone-200 text-xs pt-0" >
            <MagneticOutlineSection />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

}