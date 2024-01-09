import { Cuboid, Search, X } from 'lucide-react';
import { RenderInputComponentProps } from 'react-autosuggest';
import { EntityType } from '@/model';
import { DEFAULT_COLOR, getForegroundColor } from '@/utils/color';

interface DataModelSearchInputProps extends RenderInputComponentProps {

  selected?: EntityType; 

  onClearSearch(): void;

}

export const DataModelSearchInput = (props: DataModelSearchInputProps) => {

  const { selected, onClearSearch, ...inputProps } = props;

  return (
    <div className="flex border-b items-center">
      {selected && (
        <span 
          className="ml-1.5 px-2.5 py-1 rounded-full flex items-center"
          style={{ 
            backgroundColor: selected.color || DEFAULT_COLOR,
            color: getForegroundColor(selected.color || DEFAULT_COLOR)
          }}>
          <Cuboid className="h-3.5 w-3.5 mr-1"/> {selected.label || selected.id}
        </span>
      )}

      <div className="px-0.5 py-1.5 relative flex items-center flex-grow">
        {selected ? (
          <button onClick={onClearSearch}>
            <X strokeWidth={1.5} className="w-6 h-6 p-1 hover:bg-muted rounded-full mr-1" />
          </button>
        ) : (
          <Search className="w-8 h-4 px-2 text-muted-foreground" />
        )}
        
        <input 
          autoFocus
          {...inputProps} 
          placeholder={selected ? `Search in ${selected.label || selected.id}...` : 'Search...'}
          className="relative top-[1px] py-1 outline-none px-0.5 text-xs flex-grow" />
      </div>
    </div>    
  )

}