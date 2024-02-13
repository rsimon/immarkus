import { Folder } from '@/model';
import { useStore } from '@/store';
import { FolderItemActions } from './FolderItemActions';

interface FolderItemProps {

  folder: Folder;

  onOpen(): void;

  onSelect(): void;

}

export const FolderItem = (props: FolderItemProps) => {

  const store = useStore();

  const { images, folders } = store.getFolderContents(props.folder.handle);

  return (
    <div>
      <div 
        className="folder-item cursor-pointer relative rounded-md 
          w-[200px] h-[200px] flex justify-center items-center">

        <svg 
          className="w-[190px] h-[190px] transition-all drop-shadow-md" 
          viewBox="-600 -800 2400 2200" 
          xmlns="http://www.w3.org/2000/svg"
          onClick={props.onOpen}>
          <path 
            stroke="rgba(100,116,139,0.38)"
            fill="url(#folder-gradient)"
            vectorEffect="non-scaling-stroke"
            strokeWidth={1} strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit={10} 
            d="M -448.981 -800 C -548.981 -800 -600 -751.005 -600 -651.005 C -600 -364.652 -600 455.378 -600 1255.378 C -600 1355.378 -552.058 1400 -452.058 1400 C 447.942 1400 985.618 1400 1652.285 1400 C 1752.285 1400 1800 1349.337 1800 1249.337 C 1800 803.066 1800 145.293 1800 -454.707 C 1800 -554.707 1748.682 -600 1648.682 -600 C 1061.404 -600 1000 -600 700 -600 C 500 -600 442.009 -800 300 -800 C 205.569 -800 -327.066 -800 -448.981 -800 Z" transform="matrix(1, 0, 0, 1, 0, 2.2737367544323206e-13)"/>
        </svg>
        
        <div className="absolute bottom-3.5 right-2 text-white text-sm pointer-events-auto">
          <FolderItemActions 
            folder={props.folder} 
            onSelect={props.onSelect} />
        </div>
      </div>

      <div className="ml-2">
        <div>
          <h3
            className="text-sm max-w-[200px] overflow-hidden text-ellipsis">
            {props.folder.name}
          </h3>
          <p className="pt-1 text-xs text-muted-foreground">
            {images.length === 0 && folders.length === 0 ? 
                'Empty' : 
              images.length > 0 && folders.length > 0 ?
                `${images.length} Image${images.length > 1 ? 's' : ''} · ${folders.length} Subfolder${folders.length > 1 ? 's' : ''}` :
              images.length > 0 ?
                `${images.length} Image${images.length > 1 ? 's' : ''}` :
                `${folders.length} Subfolder${folders.length > 1 ? 's' : ''}`
            }
          </p>
        </div>
      </div>
    </div>
  )

}