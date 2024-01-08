import { Children, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ReactAutosuggest from 'react-autosuggest';
import type { EntityType } from '@/model';
import { useDataModel } from '@/store';

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
    const hasMoreAncestors = Boolean(parent?.parentId);
    const children = model.getChildTypes(type.id);

    // Just a hack for testing
    let str = '';

    if (hasMoreAncestors)
      str += '... > ';

    if (parent)
      str += `${parent.id} > `;

    str += `${type.label || type.id}`;

    if (children.length > 0)
      str += ` (${children.length} children)`;

    return (
      <div 
        className="suggestion" 
        data-highlighted={isHighlighted ? 'true' : undefined}>
        {str}
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
    <form onSubmit={onSubmit}>
      <div className="im-searchbox">
        {path.length > 0 && (
          <ol>
            {path.map(type => (
              <li key={type.id}>{type.id}</li>
            ))}
          </ol>
        )}

        <ReactAutosuggest 
          alwaysRenderSuggestions
          suggestions={suggestions} 
          onSuggestionSelected={(evt, { suggestion }) => onSelectSuggestion(suggestion)}
          onSuggestionsFetchRequested={onGetSuggestions}
          onSuggestionsClearRequested={() => setSuggestions([])}
          getSuggestionValue={suggestion => suggestion.id}
          renderSuggestionsContainer={({ containerProps, children }) => Children.toArray(children).length > 0 ? (
            <div {...containerProps}>
              {children}
            </div>
          ) : null}
          renderSuggestion={renderSuggestion}
          inputProps={{
            value: query,
            onChange: (_, { newValue }) => setQuery(newValue)
          }} />
        
        <button type="button" onClick={onClearSearch}>
          <X size={16} />
        </button>
      </div>
    </form>
  )

}