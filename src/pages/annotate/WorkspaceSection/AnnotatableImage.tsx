import { OpenSeadragonAnnotator, OpenSeadragonViewer } from '@annotorious/react';
import { Image } from '@/model';
import { Annotorious } from '@annotorious/react-manifold';

import '@annotorious/react/annotorious-react.css';

interface AnnotatableImageProps {

  image: Image;

}

export const AnnotatableImage = (props: AnnotatableImageProps) => {

  // For now, this just returns an OpenSeadragon viewer.

  return (
    <Annotorious source={props.image.id}>
      <OpenSeadragonAnnotator>
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
      </OpenSeadragonAnnotator>
    </Annotorious>
  )

}