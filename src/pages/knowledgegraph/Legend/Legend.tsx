import { PALETTE } from '../Palette';

interface LegendProps {

  includeFolders?: boolean;

}

export const Legend = (props: LegendProps) => {

  return (
    <div className="absolute bottom-7 left-7 text-sm bg-white/70 backdrop-blur-sm px-1 py-0.5 rounded">
      <ul className="flex gap-8">
        <li className="flex gap-2 items-center">
          <span 
            style={{ backgroundColor: PALETTE['blue']}} 
            className="block w-[12px] h-[12px] rounded-full"/>
          <span>Image</span>
        </li>

        {props.includeFolders && (
          <li className="flex gap-2 items-center">
            <span 
              style={{ backgroundColor: PALETTE['purple']}} 
              className="block w-[12px] h-[12px] rounded-full" />
            <span>Sub-Folder</span>
          </li>
        )}

        <li className="flex gap-2 items-center">
          <span 
            style={{ backgroundColor: PALETTE['green']}} 
            className="block w-[12px] h-[12px] rounded-full" />
          <span>Entity Class</span>
        </li>
      </ul>
    </div>
  )

}