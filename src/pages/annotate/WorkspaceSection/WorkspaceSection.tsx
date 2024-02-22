import { useEffect, useState } from 'react';
import { Mosaic, MosaicNode } from 'react-mosaic-component';
import { Image, LoadedImage } from '@/model';
import { AnnotatableImage } from './AnnotatableImage';
import { Tool, ToolMode } from '../Tool';
import { WorkspaceWindow } from './WorkspaceWindow';
import { v4 as uuidv4 } from 'uuid';

import 'react-mosaic-component/react-mosaic-component.css';

interface WorkspaceSectionProps {

  images: LoadedImage[];

  mode: ToolMode;

  tool: Tool;

  onAddImage(image: Image): void;

  onChangeImages(images: Image[]): void;

  onRemoveImage(image: Image): void;

}

const initial = {
  "direction": "row",
  "first": "a",
  "second": "b",
  "splitPercentage": 40
} as MosaicNode<string>;

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
  
  // const [windowMap, setWindowMap] = useState<{ windowId: string, image: LoadedImage }[]>([]);


  useEffect(() => {
    if (props.images.length > 1) {
      console.log('rendering initial view');

      const view = createInitialValue(props.images.map(i => i.id));

      console.log(view);

      setValue(view);
    } else {
      console.log('not enough images');
    }

    /*
    setWindowMap(entries => {
      const diff = props.images.length - entries.length;

      if (diff === 0) {
        return entries.map(({ windowId }, idx) => ({ windowId, image: props.images[idx] }));
      } else if (diff > 0) {
        // More images
        return [
          ...entries.map(({ windowId }, idx) => ({ windowId, image: props.images[idx] })),
          ...props.images.slice(-diff).map(image => ({ windowId: uuidv4(), image: image }))
        ];
      } else {
        // Fewer images
        return entries.slice(0, props.images.length)
          .map(({ windowId}, idx) => ({ windowId, image: props.images[idx] }));
      }
    });
    */
  }, [props.images?.map(i => i.id).join()]);

  /*
  const onChangeImage = (windowId: string, image: Image) => {
    const nextImages = windowMap
      .map(entry => entry.windowId === windowId ? image : entry.image);

    props.onChangeImages(nextImages);
  }
  */

  /*
  const onClose = (windowId: string) => {
    const nextImages = windowMap
      .filter(entry => entry.windowId !== windowId)
      .map(entry => entry.image);

    props.onChangeImages(nextImages);
  }
  */
  
  return (
    <section className="workspace flex-grow bg-muted">
      {value && (
        <Mosaic<string>
          renderTile={id => (<div>{id}</div>)}
          value={value}
          onChange={setValue}
        />
      )}
    </section>
  )

}