import { ALargeSmall, ChevronDown, Cuboid, Languages, NotebookPen, X } from 'lucide-react';
import { Button } from '@/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

interface PropertiesFormActionsProps {

  hasNote: boolean;

  onAddTag(): void;

  onAddNote(): void;

  onChangeFontSize(): void;

  onClearNote(): void;
  
}

export const PropertiesFormActions = (props: PropertiesFormActionsProps) => {

  return (
    <div className="pt-0.5 pb-2 flex gap-1 justify-between text-muted-foreground mb-4">
      <Button 
        variant="ghost" 
        type="button"
        className="text-xs pl-2 pr-2.5 font-normal py-3.5 h-6 rounded-full whitespace-nowrap"
        onClick={props.onAddTag}>
        <Cuboid className="h-3.5 w-3.5 mr-1.5" /> Add Tag
      </Button>

      {props.hasNote ? (
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-6 w-auto py-3.5 px-2 rounded-full"
                onClick={props.onChangeFontSize}>
                <ALargeSmall className="size-4.5" />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              Change font size
            </TooltipContent>
          </Tooltip>
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

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="h-6 w-auto py-3.5 px-2 rounded-full font-normal text-xs"
                onClick={props.onClearNote}>
                Clear Note
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              Clear note
            </TooltipContent>
          </Tooltip>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          type="button"
          className="text-xs pl-2 pr-2.5 py-3.5 h-6 font-normal rounded-full whitespace-nowrap"
          onClick={props.onAddNote}>
          <NotebookPen className="h-4 w-4 mr-1" /> Add Note
        </Button>
      )}
    </div>
  )

}