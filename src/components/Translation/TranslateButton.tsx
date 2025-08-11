import { useMemo } from 'react';
import { ChevronDown, Languages } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/Tooltip';
import { ServiceRegistry } from '@/services';
import { cn } from '@/ui/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/ui/DropdownMenu';

const connectors = ServiceRegistry.listAvailableConnectors('TRANSLATION');

interface TranslateButtonProps {

  onTranslated(translation: string | null): void;

}

export const TranslateButton = (props: TranslateButtonProps) => {

  const disabled = useMemo(() => {
    if (connectors.length === 0) return true;

    return false;
  }, []);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn(
            'group h-6 py-3.5 px-2 rounded-full transition-colors flex items-center hover:bg-accent',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}>
          <button
            disabled={disabled}
            type="button"
            className={cn('p-0 pr-1 flex items-center justify-center bg-transparent hover:text-accent-foreground',
              disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
            onClick={() => { alert('yay')}}>
            <Languages className="size-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger disabled={disabled} asChild>
              <button
                type="button"
                className={cn('flex items-center justify-center p-0 bg-transparent border-none', 
                  disabled ? 'cursor-not-allowed' : 'hover:text-accent-foreground cursor-pointer')}>
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