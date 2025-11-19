import { useMemo } from 'react';
import { Annotation } from 'cozy-iiif';

interface IIIFCanvasAnnotationCardProps {

  annotation: Annotation;

}

export const IIIFCanvasAnnotationCard = (props: IIIFCanvasAnnotationCardProps) => {

  const value = useMemo(() => {
    if (!props.annotation.body) return;

    const bodies = Array.isArray(props.annotation.body) ?
      props.annotation.body : [props.annotation.body];

    return bodies.map(b => {
      if (typeof b === 'object' && typeof (b as any).value === 'string') {
        return (b as any).value as string;
      }
    }).join(' ');
  }, [props.annotation]);

  return (
    <div className="border rounded p-3 leading-relaxed">
      <div 
        className="[&_a]:text-sky-700 hover:[&_a]:underline"
        dangerouslySetInnerHTML={{ __html: value || '' }} />
    </div>
  )

}