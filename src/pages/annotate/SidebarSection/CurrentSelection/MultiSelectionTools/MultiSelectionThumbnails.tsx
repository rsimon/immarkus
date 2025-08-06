import { AnnotationThumbnail } from '@/components/AnnotationThumbnail';
import { ImageAnnotation } from '@annotorious/react';
import { useMemo } from 'react';

interface MultiSelectionThumbnailsProps {

  selected: ImageAnnotation[];

}

const stackStyles = [
  { transform: 'rotate(-8deg) translate(-4px, 6px)', zIndex: 1 },
  { transform: 'rotate(3deg) translate(2px, -2px)', zIndex: 2 },
  { transform: 'rotate(-2deg) translate(1px, 1px)', zIndex: 3 }
];

export const MultiSelectionThumbnails = (props: MultiSelectionThumbnailsProps) => {

  const first = useMemo(() => [...props.selected].slice(0, 3).reverse(), [props.selected]);

  return (
    <div className="h-34 px-2 py-3 flex">
      <div className="w-26">
        {first.map((annotation, index) => (
          <AnnotationThumbnail
            key={annotation.id}
            annotation={annotation}
            className={`
              border border-neutral-400/50 absolute w-20 h-20 rounded-lg shadow-lg
              flex items-center justify-center text-white text-2xl font-bold
              transition-all duration-300 hover:scale-110 cursor-pointer
            `}
            style={{
              ...stackStyles[index % stackStyles.length],
              transformOrigin: 'center center'
            }}
          />
        ))}
      </div>

      <div className="h-full px-1 py-2 font-medium">
        {props.selected.length} Annotations
      </div>
    </div>
  )

}