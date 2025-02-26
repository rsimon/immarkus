import { useEffect, useRef, useState } from 'react';
import { useDraggable } from '@neodrag/react';
import { Grip, Magnet, SquareDashedMousePointer, SquareSquare } from 'lucide-react';
import { ClickAndRefinePanel } from './panels/ClickAndRefinePanel';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/ui/Accordion';
import { BoxPanel, MagneticOutlinePanel } from './panels';

export const SmartSelectionPanel = () => {

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

  return (
    <div
      ref={el}
      className="bg-white absolute w-60 top-16 right-6 rounded border shadow-lg z-30">

      <div className="flex items-center gap-1.5 text-xs font-semibold p-2 border-b cursor-grab drag-handle">
        <Grip className="size-4" />
        <span>Smart Selection Tools</span>
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

          <AccordionContent className="bg-muted border-t text-xs pt-0" asChild>
            <ClickAndRefinePanel />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="box">
          <AccordionTrigger 
            className="text-xs font-normal hover:no-underline overflow-hidden p-2 gap-2 justify-start">
            <span className="flex grow items-center gap-2 justify-start">
              <SquareSquare className="size-4"/> Box
            </span>
          </AccordionTrigger>

          <AccordionContent className="bg-muted border-t text-xs pt-0" >
            <BoxPanel />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="magnetic-outline" className="border-b-0">
          <AccordionTrigger 
            className="text-xs font-normal hover:no-underline overflow-hidden p-2 gap-2 justify-start">
            <span className="flex grow items-center gap-2 justify-start">
              <Magnet className="size-4" /> Magnetic Outline
            </span>
          </AccordionTrigger>

          <AccordionContent className="bg-muted border-t text-xs pt-0" >
            <MagneticOutlinePanel />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )

}