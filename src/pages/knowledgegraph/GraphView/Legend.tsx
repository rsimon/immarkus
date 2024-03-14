import { PALETTE } from './Palette';

export const Legend = () => {

  return (
    <div className="absolute bottom-6 left-8 text-sm">
      <ul className="flex gap-10">
        <li className="flex gap-2 items-center">
          <span 
            style={{ backgroundColor: PALETTE['orange']}} 
            className="block w-[12px] h-[12px] rounded-full"/>
          <span>Image</span>
        </li>

        <li className="flex gap-2 items-center">
          <span 
            style={{ backgroundColor: PALETTE['blue']}} 
            className="block w-[12px] h-[12px] rounded-full" />
          <span>Entity Class</span>
        </li>
      </ul>
    </div>
  )

}