import { Fragment, useMemo } from 'react';
import { ScanText, TextAlignStart } from 'lucide-react';
import type { AnnotationBody, User, W3CAnnotationBody } from '@annotorious/react';
import { EntityType } from '@/model';
import { TooltipProvider } from '@/ui/Tooltip';
import { cn } from '@/ui/utils';
import { splitLines, splitLineSegments, type Highlight, type Segment } from './transcriptionUtils';
import { HighlightedSegment } from './HighlightedSegment';

interface TranscriptionProps {

  creator?: User; 

  transcription: AnnotationBody;

  entities: { body: W3CAnnotationBody; entityType: EntityType }[];

}

export const Transcription = (props: TranscriptionProps) => {
  const { creator, entities } = props;

  const value = props.transcription.value ?? '';

  const hasGenerator = creator?.name && 'type' in creator;

  const highlights = useMemo<Highlight[]>(() => entities.flatMap(({ body, entityType }) => {
    if (!('references' in body) || !Array.isArray(body.references))
      return [];

    return body.references.map(ref => ({ ...ref, body, entityType }));
  }).sort((a, b) => a.start - b.start), [entities]);

  const lines = useMemo(() => splitLines(value), [value]);

  const renderLine = (line: Segment, lineIndex: number) => {
    const verticalPadding = cn(
      lineIndex === 0 && 'pt-1.5',
      lineIndex === lines.length - 1 && 'pb-1'
    );

    return (
      <Fragment key={lineIndex}>
        <span className={cn(
          'flex self-stretch items-start justify-center bg-muted/60 border-r border-border/70 pl-0.75 pt-0.5 pr-1 select-none text-[11px] text-right text-muted-foreground/70 tabular-nums',
          verticalPadding
        )}>
          {lineIndex + 1}
        </span>

        <span className={cn('self-start min-w-0 pl-3 font-serif ', verticalPadding)}>
          {splitLineSegments(line, highlights).map(({ start, end, highlight }) => {
            const text = value.slice(start, end);
            return highlight
              ? <HighlightedSegment key={start} highlight={highlight}>{text}</HighlightedSegment>
              : text;
          })}
        </span>
      </Fragment>
    )
  }

  return (
    <div className="mb-6">
      {hasGenerator && (
        <div className="text-[11px] flex gap-1 items-center justify-end mb-2.5 mr-0.5 text-muted-foreground/80">
          {creator.name} <ScanText className="size-3.5 mb-px" /> 
        </div>
      )}

      <TooltipProvider delayDuration={200}>
        <div className="border rounded">
          <div className="flex gap-1 items-center p-1 uppercase font-medium text-muted-foreground tracking-wide text-[10px]">
            <TextAlignStart className="size-3 mb-px" strokeWidth={2.5}/> Transcription
          </div>

          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start whitespace-pre-wrap tracking-wide rounded-b leading-relaxed border-t max-h-120 overflow-y-auto">
            {lines.map(renderLine)}
          </div>
        </div>
      </TooltipProvider>
    </div>
  )

}