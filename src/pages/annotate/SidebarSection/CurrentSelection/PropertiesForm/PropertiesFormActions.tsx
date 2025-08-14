import { Cuboid, NotebookPen } from 'lucide-react';
import { Button } from '@/ui/Button';
import { FontSize, FontSizeButton } from '@/components/FontSize';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { TranslateButton, TranslationSettings } from '@/components/Translation';

interface PropertiesFormActionsProps {

  hasNote: boolean;

  onAddTag(): void;

  onAddNote(): void;

  onChangeFontSize(size: FontSize): void;

  onClearNote(): void;

  onTranslate(settings: TranslationSettings): void;
  
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
          <FontSizeButton 
            onChangeFontSize={props.onChangeFontSize} />

          <TranslateButton
            onClickTranslate={props.onTranslate} />

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