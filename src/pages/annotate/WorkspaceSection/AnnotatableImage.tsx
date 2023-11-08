import { OpenSeadragonAnnotator, OpenSeadragonViewer, W3CImageFormat } from '@annotorious/react';
import { Image } from '@/model';
import { Annotorious } from '@annotorious/react-manifold';

import '@annotorious/react/annotorious-react.css';
import { AnnotoriousStoragePlugin } from './AnnotoriousStoragePlugin';

interface AnnotatableImageProps {

  image: Image;

  onSaving(): void;

  onSaved(): void;

  onSaveError(error: Error): void;

}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  return (
    <Annotorious source={props.image.id}>
      <OpenSeadragonAnnotator
        adapter={W3CImageFormat(props.image.name)}>

        <OpenSeadragonViewer
          className="osd-container"
          options={{
            tileSources: {
              type: 'image',
              url: URL.createObjectURL(props.image.data)
            },
            gestureSettingsMouse: {
              clickToZoom: false
            },
            showNavigationControl: false,
            crossOriginPolicy: 'Anonymous'
          }} />

        <AnnotoriousStoragePlugin 
          imageId={props.image.id}
          onSaving={props.onSaving} 
          onSaved={props.onSaved}
          onError={props.onSaveError} />
      </OpenSeadragonAnnotator>
    </Annotorious>
  )

}