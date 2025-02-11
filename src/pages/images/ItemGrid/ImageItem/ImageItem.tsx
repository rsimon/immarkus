import { useEffect, useState } from 'react';
import { MessagesSquare } from 'lucide-react';
import { LoadedFileImage } from '@/model';
import { ImageItemActions } from './ImageItemActions';
import { useStore } from '@/store';
import { useImageDimensions } from '@/utils/useImageDimensions';

interface ImageItemProps {

  annotationCount: number;

  image: LoadedFileImage;

  selected?: boolean;

  onOpen(): void;

  onSelect(): void;

}

export const ImageItem = (props: ImageItemProps) => {

  const { image } = props;

  const store = useStore();

  const { onLoad, dimensions } = useImageDimensions();

  return (
    <div>
      <div className="flex items-center justify-center w-[180px] h-[200px]">
        <div 
          data-selected={props.selected ? true : undefined}
          className="data-selected:outline-2 outline-offset-2 image-item cursor-pointer relative overflow-hidden rounded-md border w-[178px] h-[178px]">
          <img
            onLoad={onLoad}
            loading="lazy"
            src={URL.createObjectURL(image.data)}
            alt={image.name}
            onClick={props.onOpen}
            className="h-full w-full object-cover object-center transition-all aspect-square"
          />

          <div className="image-wrapper absolute bottom-0 px-3 pt-10 pb-3 left-0 w-full pointer-events-auto">
            <div className="text-white text-sm">
              <MessagesSquare 
                size={18} 
                className="inline align-text-bottom mr-1" /> 
                {props.annotationCount}
            </div>

            <div className="absolute bottom-0.5 right-2 text-white text-sm pointer-events-auto">
              <ImageItemActions 
                image={image} 
                onSelect={props.onSelect}/>
            </div>
          </div>
        </div>
      </div>
      
      <div className="text-sm ml-1 max-w-[190px] overflow-hidden">
        <h3 
          className="overflow-hidden whitespace-nowrap text-ellipsis">
          {image.name}
        </h3>
        <p className="pt-1 text-xs text-muted-foreground">
          {dimensions && (
            <>{dimensions[0].toLocaleString()} x {dimensions[1].toLocaleString()}</>
          )}
        </p>
      </div>
    </div>
  )

}