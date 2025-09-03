import { Cuboid, ListTree, Search, X } from 'lucide-react';
import { forwardRef } from 'react';
import { RenderInputComponentProps } from 'react-autosuggest';
import { EntityType } from '@/model';
import { DEFAULT_COLOR, getForegroundColor } from '@/utils/color';
import { Separator } from '@/ui/Separator';

interface EntityTypeBrowserInputProps extends RenderInputComponentProps {

  selected?: EntityType; 

  onClearSearch(): void;

}

export const EntityTypeBrowserInput = forwardRef((props: EntityTypeBrowserInputProps, ref: React.Ref<HTMLDivElement>) => {

  const { selected, onClearSearch, ...inputProps } = props;

  return (
    <div ref={ref} className="flex border-b items-center py-1 px-1">
      {selected && (
        <span 
          className="ml-1.5 mr-0.5 px-2.5 py-1 rounded-full flex items-center text-xs"
          style={{ 
            backgroundColor: selected.color || DEFAULT_COLOR,
            color: getForegroundColor(selected.color || DEFAULT_COLOR)
          }}>
          {selected.label || selected.id}
        </span>
      )}

      <div className="px-0.5 py-1.5 relative flex items-center grow">
        {!selected && (
          <Search className="w-8 h-4 px-2 text-muted-foreground" />
        )}
        
        <input 
          autoFocus
          {...inputProps}
          placeholder={selected ? `Search in ${selected.label || selected.id}...` : 'Search...'}
          className="relative top-[1px] py-1 outline-hidden px-0.5 grow" />
      </div>

      <div className="pr-1.5 flex items-center">
        {(selected || inputProps.value) && (        
          <button 
            onClick={onClearSearch}
            className="rounded-sm text-muted-foreground transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground">
            <X
              strokeWidth={1.7}
              className="w-6 h-6 p-1 text-muted-foreground hover:text-black" />
          </button>
        )}
      </div>
    </div>    
  )

});