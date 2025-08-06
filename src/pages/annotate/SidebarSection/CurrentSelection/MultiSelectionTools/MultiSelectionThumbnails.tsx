import { ImageAnnotation } from '@annotorious/react';

interface MultiSelectionThumbnailsProps {

  selected: ImageAnnotation[];

}

export const MultiSelectionThumbnails = (props: MultiSelectionThumbnailsProps) => {

  return (
    <div className="">
      {props.selected.length} selected.
    </div>
  )

}