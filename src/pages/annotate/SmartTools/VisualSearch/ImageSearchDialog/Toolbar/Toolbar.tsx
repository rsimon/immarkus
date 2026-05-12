import { Grid2X2, Grid3X3, Square, X } from 'lucide-react';
import { LoadedImage } from '@/model';
import { Button } from '@/ui/Button';
import { DialogHeader, DialogTitle } from '@/ui/Dialog';
import { Separator } from '@/ui/Separator';
import { Skeleton } from '@/ui/Skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/ui/ToggleGroup';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { IconSize, ResolvedSearchResult, SearchScope } from '../ImageSearchDialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Label } from '@/ui/Label';
import { cn } from '@/ui/utils';

interface ToolbarProps {
  
  disabled: boolean;

  queryImage?: Blob;

  imagesInWorkspace: LoadedImage[];

  searchScope: SearchScope;

  iconSize: IconSize;

  results?: ResolvedSearchResult[];

  onChangeSearchScope(scope: SearchScope): void;

  onChangeIconSize(size: IconSize): void;

  onClose(): void;

}

export const Toolbar = (props: ToolbarProps) => {

  return (
    <DialogHeader className="flex flex-row justify-between border-b bg-white">
      <DialogTitle className="m-0 p-2">
        <div className="flex items-start gap-2">
          {props.queryImage ? (
            <img
              className="size-12 rounded-sm object-cover"
              src={URL.createObjectURL(props.queryImage)} />
          ) : (
            <Skeleton className="size-12 rounded-sm" />
          )}
          
          <div className="p-0.5 text-xs font-normal text-muted-foreground">
            {props.results ? (
              <span>Showing {props.results.length} matches</span>
            ) : (
              <span>Searching...</span>
            )}
          </div>
        </div>
      </DialogTitle>

      <VisuallyHidden>
        <DialogDescription>
          Visual similarity search results for the selected image region
        </DialogDescription>
      </VisuallyHidden>

      <div className="flex gap-2.5 items-center mb-0">
        <Label className={cn(
          'text-xs font-normal',
          props.disabled && 'opacity-50'
        )}>
          Search inside
        </Label>

        <ToggleGroup
          type="single"
          variant="outline"
          className="shadow-none! mb-0"
          value={props.searchScope}
          onValueChange={value => props.onChangeSearchScope(value as SearchScope)}>
          <ToggleGroupItem 
            value="this"
            className="text-xs font-normal">
            Source Image
          </ToggleGroupItem>

          <ToggleGroupItem
            disabled={props.imagesInWorkspace.length < 2}
            value="workspace"
            className="text-xs font-normal">
            Currently Open Images
          </ToggleGroupItem>

          <ToggleGroupItem
            value="all"
            className="text-xs font-normal">
            All Images
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="flex gap-1 items-center pr-2">
        <ToggleGroup 
          disabled={props.disabled}
          type="single"
          className="gap-1"
          value={props.iconSize}
          onValueChange={value => props.onChangeIconSize(value as IconSize)}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ToggleGroupItem value="sm" size="sm">
                  <Grid3X3 className="size-4" />
                </ToggleGroupItem>
              </div>
            </TooltipTrigger>
            <TooltipContent>Small Thumbnails</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ToggleGroupItem value="md" size="sm">
                  <Grid2X2 className="size-4" />
                </ToggleGroupItem>
              </div>
            </TooltipTrigger>
            <TooltipContent>Medium Thumbnails</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <ToggleGroupItem value="lg" size="sm">
                  <Square className="size-4" />
                </ToggleGroupItem>
              </div>
            </TooltipTrigger>
            <TooltipContent>Large Thumbnails</TooltipContent>
          </Tooltip>
        </ToggleGroup>

        <Separator orientation="vertical" className="h-4" />

        <Button
          variant="ghost"
          size="icon"
          onClick={props.onClose}>
          <X className="size-4" />
        </Button>
      </div>
    </DialogHeader>
  )

}