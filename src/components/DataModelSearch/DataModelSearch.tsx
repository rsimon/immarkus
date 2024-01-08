import { useEffect, useState } from 'react';
import { ChevronRight, ListTree, Search, X } from 'lucide-react';
import ReactAutosuggest from 'react-autosuggest';
import type { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { DEFAULT_COLOR, getForegroundColor } from '@/utils/color';

import './DataModelSearch.css';

interface DataModelSearchProps {

}

export const DataModelSearch = (props: DataModelSearchProps) => {

  const model = useDataModel();

  const [query, setQuery] = useState('');

  const [path, setPath] = useState<EntityType[]>([]);

  const [suggestions, setSuggestions] = useState<EntityType[]>([]);

  const onGetSuggestions = ({ value }: { value: string }) => {   
    if (path.length > 0) {
      const parentId = path[path.length - 1].id;

      if (value) {
        setSuggestions(model.searchEntityTypeBranch(value, parentId));
      } else {
        setSuggestions(model.getChildTypes(parentId));
      }
    } else {
      value 
        ? setSuggestions(model.searchEntityTypes(value))
        : setSuggestions(model.getRootTypes())
    }
  }

  const renderSuggestion = (type: EntityType, { isHighlighted }) => {
    const parent = type.parentId ? model.getEntityType(type.parentId) : undefined;    
    const children = model.getChildTypes(type.id);

    const color = type.color || DEFAULT_COLOR;

    return (
      <div 
        className="pl-1 pr-2 py-1 rounded-sm data-[highlighted]:bg-accent cursor-pointer" 
        data-highlighted={isHighlighted ? 'true' : undefined}>
        
        <div className="flex justify-between text-muted-foreground text-xs">
          <div className="flex items-center">
            <span 
              className="pip-small ml-1.5"
              style= {{
                  backgroundColor: color,
                  color: getForegroundColor(color)
              }} />

            <span 
              className="inline-flex items-end pl-1.5 pr-1 py-0.5 rounded-sm text-black">
              {type.label || type.id}
            </span>

            {parent && (
              <span>
                ({parent.label || parent.id})
              </span>
            )}
          </div>

          <div>
            {children.length > 0 && (
              <div className="flex text-[11px] items-center mt-[0.5px]">
                <ListTree className="w-3.5 h-3.5" />

                <span className="ml-0.5 mt-[0.5px]">
                  {children.length} child{children.length > 1 && 'ren'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  const onSelectSuggestion = (type: EntityType) => setPath(p => ([...p, type ]));

  // Clear the query AFTER the path has changed. This will
  // then trigger a call to onGetSuggestions from react-autosuggest.
  useEffect(() => {
    setQuery('');
    if (path.length > 0) {
      setSuggestions(model.getChildTypes(path[path.length - 1].id))
    } else {
      setSuggestions(model.getRootTypes());
    }
  }, [ path ]);

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    const type = model.getEntityType(query);
    if (type)
      onSelectSuggestion(type);
  }

  const onClearSearch = () => {
    setQuery('');
    setPath([]);
  }

  return (
    <form 
      onSubmit={onSubmit}>
      <div className="text-xs">
        <ReactAutosuggest 
          alwaysRenderSuggestions
          suggestions={suggestions} 
          onSuggestionSelected={(evt, { suggestion }) => onSelectSuggestion(suggestion)}
          onSuggestionsFetchRequested={onGetSuggestions}
          onSuggestionsClearRequested={() => onGetSuggestions({ value: query })}
          getSuggestionValue={suggestion => suggestion.id}
          renderSuggestionsContainer={({ containerProps, children }) => suggestions.length > 0 ? (
            <div
              {...containerProps} 
              className="w-full p-1.5">
              {children}
            </div>
          ) : (
            <div className="flex justify-center items-center p-6 text-sm text-muted-foreground">No results</div>
          )}
          renderInputComponent={inputProps => (
            <div className="flex border-b">
              {path.length > 0 && (
                <ol className="flex items-center">
                  {path.map(type => (
                    <li 
                      className="ml-1.5 px-1.5 py-1 rounded-sm"
                      style={{ 
                        backgroundColor: type.color || DEFAULT_COLOR,
                        color: getForegroundColor(type.color || DEFAULT_COLOR)
                      }}
                      key={type.id}>{type.label || type.id}</li>
                  ))}
                </ol>
              )}

              <div className="px-0.5 py-1.5 relative flex items-center flex-grow">
                {path.length === 0 ? (
                  <Search className="w-8 h-4 px-2 text-muted-foreground" />
                ) : (
                  <button onClick={() => onClearSearch()}>
                    <X strokeWidth={1.5} className="w-6 h-6 p-1 hover:bg-muted rounded-full mr-1" />
                  </button>
                )}
                
                <input 
                  autoFocus
                  {...inputProps} 
                  placeholder="Search..."
                  className="relative top-[1px] py-1 outline-none px-0.5 text-xs flex-grow" />
              </div>
            </div>
          )}
          renderSuggestion={renderSuggestion}
          shouldRenderSuggestions={() => true}
          inputProps={{
            value: query,

            onChange: (_, { newValue }) => setQuery(newValue)
          }} />
      </div>
    </form>
  )

}