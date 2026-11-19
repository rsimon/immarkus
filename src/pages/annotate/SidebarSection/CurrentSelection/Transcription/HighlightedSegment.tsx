import { ReactNode } from 'react';
import chroma from 'chroma-js';
import { AnnotationValuePreview } from '@/components/AnnotationValuePreview';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { DEFAULT_COLOR, getForegroundColor } from '@/utils/color';
import { Highlight } from './transcriptionUtils';

interface HighlightedSegmentProps {

  highlight: Highlight;

  children: ReactNode;

}

export const HighlightedSegment = (props: HighlightedSegmentProps) => {
  const { body, entityType } = props.highlight;
  const color = entityType.color || DEFAULT_COLOR;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <mark
          className="px-px border-b-2"
          style={{ backgroundColor: chroma(color).alpha(0.25).hex(), borderColor: color }}>
          {props.children}
        </mark>
      </TooltipTrigger>

      <TooltipContent className="px-1.5 py-0.5 font-sans">
        <AnnotationValuePreview bodies={[body]} />
      </TooltipContent>
    </Tooltip>
  )

}