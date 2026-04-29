import { LoadedImage } from '@/model';
import { Checkbox } from '@/ui/Checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { TooltipPortal } from '@radix-ui/react-tooltip';
import { Badge } from '@/ui/Badge';
import { getImageColor, THIS_IMAGE_COLOR } from '../ImageSearchPalette';
import { cn } from '@/ui/utils';

interface SidebarImageItemProps {

  isSourceImage?: boolean;

  isInWorkspace?: boolean;

  isSelected: boolean;

  isPreviewOpen: boolean;

  isCurrentPreview: boolean;

  image: LoadedImage;

  topScore: number;

  matches: number;

  onSetSelected(selected: boolean): void;

  onTogglePreview(): void;

}

export const SidebarImageItem = (props: SidebarImageItemProps) => {
  
  const { image, isSourceImage } = props;

  const isDisabled = props.isPreviewOpen && !props.isCurrentPreview;

  const borderColor = isSourceImage ? THIS_IMAGE_COLOR : getImageColor(image.id);

  return (
    <div className={cn(
      'flex items-center gap-2 w-full relative',
      isDisabled && 'opacity-30'
      )}>
      <Checkbox  
        disabled={isDisabled}
        className="shrink-0"
        checked={props.isSelected} 
        onCheckedChange={checked => props.onSetSelected(checked as boolean)}/>

      <button
        className="flex items-center gap-2 text-left overflow-hidden"
        onClick={props.onTogglePreview}>
        <div 
          className="relative shrink-0 rounded-md border-2 p-px"
          style={{
            borderColor
          }}>
          <img
            loading="lazy"
            className="rounded size-8 object-cover"
            src={'data' in image ? URL.createObjectURL(image.data) : image.canvas.getThumbnailURL(120)}
            alt={image.name} />
        </div>

        <div className="flex overflow-hidden text-xs flex-col gap-0.5 justify-center pb-px whitespace-nowrap">
          <div className="truncate">
            {'data' in image ? image.name : image.canvas.getLabel()}
          </div>

          <div className="text-[11px] text-muted-foreground">
            <strong className="font-semibold">{props.matches} hits</strong> · {Math.round(100 * props.topScore) / 100} best 
            score {props.isSourceImage ? (
              <>· <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      className="text-[11px] font-medium rounded-md py-px px-1.25"
                      style={{ 
                        backgroundColor: THIS_IMAGE_COLOR
                      }}>
                      Source
                    </Badge>
                  </TooltipTrigger>

                  <TooltipPortal>
                    <TooltipContent>
                        This image contains the query annotation
                    </TooltipContent>
                  </TooltipPortal>
                </Tooltip>
              </> 
            ) : props.isInWorkspace ? (
              <>· <Tooltip>
                <TooltipTrigger asChild>
                  <Badge 
                    className="text-[11px] font-medium rounded-md py-px px-1.25 bg-orange-400 hover:bg-orange-400">
                    Open
                  </Badge>
                </TooltipTrigger>

                <TooltipPortal>
                  <TooltipContent>
                    This image is currently open in your workspace
                  </TooltipContent>
                </TooltipPortal>
                </Tooltip>
              </>
            ) : null}
          </div>
        </div>
      </button>
    </div>
  )

}