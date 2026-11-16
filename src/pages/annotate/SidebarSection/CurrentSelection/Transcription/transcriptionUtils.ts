import { W3CAnnotationBody } from '@annotorious/react';
import { EntityType } from '@/model';

export interface Segment {

  start: number;

  end: number;

}

export interface Highlight extends Segment {

  quote: string;

  body: W3CAnnotationBody;

  entityType: EntityType;

}

export interface LineSegment extends Segment {

  highlight?: Highlight;

}

export const splitLines = (value: string): Segment[] => {
  const lines: Segment[] = [];
  let start = 0;

  for (const match of value.matchAll(/\r\n|\r|\n/g)) {
    const end = match.index!;
    lines.push({ start, end });
    start = end + match[0].length;
  }

  // the last line has no terminator after it
  lines.push({ start, end: value.length });
  return lines;
}

export const splitLineSegments = (line: Segment, highlights: Highlight[]): LineSegment[] => {
  const segments: LineSegment[] = [];
  let cursor = line.start;

  for (const highlight of highlights) {
    const start = Math.max(line.start, highlight.start);
    const end = Math.min(line.end, highlight.end);

    // not on this line, or overlaps a highlight we already emitted
    if (start >= end || start < cursor) continue;

    if (start > cursor) segments.push({ start: cursor, end: start });
    segments.push({ start, end, highlight });
    cursor = end;
  }

  if (cursor < line.end) segments.push({ start: cursor, end: line.end });
  return segments;
}