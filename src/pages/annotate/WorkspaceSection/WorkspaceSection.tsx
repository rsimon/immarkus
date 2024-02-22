import { useEffect, useState } from 'react';
import { Mosaic, MosaicNode } from 'react-mosaic-component';
import { Image, LoadedImage } from '@/model';
import { AnnotatableImage } from './AnnotatableImage';
import { Tool, ToolMode } from '../Tool';
import { WorkspaceWindow } from './WorkspaceWindow';

import 'react-mosaic-component/react-mosaic-component.css';

interface WorkspaceSectionProps {

  images: LoadedImage[];

  mode: ToolMode;

  tool: Tool;

  onAddImage(image: Image): void;

  onChangeImages(images: Image[]): void;

  onRemoveImage(image: Image): void;

}

const createInitialValue= (list: string[], direction = 'row') => {
  const [first, ...rest] = list;
  return {
    direction,
    first,
    second: rest.length === 1 ? rest[0] : createInitialValue(rest, direction === 'row' ? 'column' : 'row')
  };
}

export const WorkspaceSection = (props: WorkspaceSectionProps) => {

  const [value, setValue] = useState<MosaicNode<string>>();
  
  useEffect(() => {
    if (props.images.length > 1) {
      setValue(createInitialValue(props.images.map(i => i.id)));
    }
  }, [props.images]);

  const onChangeImage = (currentImageId: string, nextImage: Image) => {
    const nextImages = props.images
      .map(i => i.id === currentImageId ? nextImage : i);

    props.onChangeImages(nextImages);
  }

  const onClose = (imageId: string) => {
    const nextImages = props.images.filter(i => i.id !== imageId)
    props.onChangeImages(nextImages);
  }
  
  return (
    <section className="workspace flex-grow bg-muted">
      {props.images.length === 1 ? (
        <AnnotatableImage 
          image={props.images[0]} 
          mode={props.mode}
          tool={props.tool} />
      ) : props.images.length > 1 && (
        <Mosaic<string>
          renderTile={(imageId, path) => props.images.find(image => image.id === imageId) && (
            <WorkspaceWindow 
              windowId={imageId} 
              windowPath={path} 
              image={props.images.find(image => image.id === imageId)}
              mode={props.mode}
              tool={props.tool}
              onAddImage={props.onAddImage}
              onChangeImage={(_, next) => onChangeImage(imageId, next)} 
              onClose={() => onClose(imageId)} />
          )}
          value={value}
          onChange={setValue}
        />
      )}
    </section>
  )

}