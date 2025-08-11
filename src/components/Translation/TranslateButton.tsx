import { ChevronDown, Languages } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface TranslateButtonProps {

  onTranslated(translation: string | null): void;

}

export const TranslateButton = (props: TranslateButtonProps) => {

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="group h-6 py-3.5 px-2 rounded-full hover:bg-accent transition-colors flex items-center cursor-pointer">
          <button
            type="button"
            className="p-0 pr-1 flex items-center justify-center bg-transparent hover:text-accent-foreground"
            onClick={() => {/* */}}>
            <Languages className="size-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center justify-center p-0 bg-transparent border-none hover:text-accent-foreground">
                <ChevronDown className="size-3.5" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuItem>Option 1</DropdownMenuItem>
              <DropdownMenuItem>Option 2</DropdownMenuItem>
              <DropdownMenuItem>Option 3</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TooltipTrigger>

      <TooltipContent>
        Show translation
      </TooltipContent>
    </Tooltip>
  )

}