import { useMemo } from 'react';
import { ImageAnnotation } from '@annotorious/react';
import { useStore } from '@/store';

interface RelationsProps {

  annotation: ImageAnnotation;

}

export const Relations = (props: RelationsProps) => {

  const store = useStore();

  const relations = useMemo(() => (
    store.getRelatedAnnotations(props.annotation.id)
  ), [props.annotation.id]);

  console.log(relations);

  return (
    <div>
      <h3 className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm 
        ml-0.5 flex gap-1.5 py-4 items-center">
        <span>Related</span>
      </h3>
    </div>
  )

}