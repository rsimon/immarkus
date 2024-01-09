import { useEffect, useState } from 'react';
import ReactAutosuggest from 'react-autosuggest';
import type { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { DataModelSearchInput } from './DataModelSearchInput';
import { DataModelSearchResult } from './DataModelSearchResult';

import './DataModelSearch.css';

interface DataModelSearchProps {

  onSelect(type: EntityType): void;

  onConfirm(type: EntityType): void;

}

export const DataModelSearch = (props: DataModelSearchProps) => {

  const model = useDataModel();

  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState<EntityType | undefined>();

  const [suggestions, setSuggestions] = useState<EntityType[]>([]);

  const onGetSuggestions = ({ value }: { value: string }) => {   
    if (selected) {
      // There is a selected class - search in branch or show all
      if (value)
        setSuggestions(model.searchEntityTypeBranch(value, selected.id));
      else
        setSuggestions(model.getChildTypes(selected.id));
    } else {
      // No selection - search all or show root classes
      if (value)
        setSuggestions(model.searchEntityTypes(value))
      else
        setSuggestions(model.getRootTypes())
    }
  }

  const renderSuggestion = (type: EntityType, { isHighlighted }) => (
    <DataModelSearchResult 
      type={type} 
      highlighted={isHighlighted} 
      selected={selected} />
  )

  const onSelect = (type: EntityType) => {
    setSelected(type);
    props.onSelect(type);

    const hasChildren = model.hasChildTypes(type.id);
    if (!hasChildren)
      props.onConfirm(type);
  }

  const onSubmitForm = (evt: React.FormEvent) => {
    evt.preventDefault();

    const type = model.getEntityType(query);
    if (type)
      onSelect(type);  
  }

  // After the selection changed, clear the query and update suggestions
  useEffect(() => {
    setQuery('');

    if (selected)
      setSuggestions(model.getChildTypes(selected.id))
    else
      setSuggestions(model.getRootTypes());
  }, [ selected ]);

  const onClearSearch = () => {
    setQuery('');
    setSelected(undefined);
  }

  return (
    <form 
      onSubmit={onSubmitForm}>
      <div className="text-xs">
        <ReactAutosuggest 
          alwaysRenderSuggestions
          suggestions={suggestions} 
          getSuggestionValue={suggestion => suggestion.id}
          onSuggestionSelected={(_, { suggestion }) => onSelect(suggestion)}
          onSuggestionsFetchRequested={onGetSuggestions}
          shouldRenderSuggestions={() => true}
          renderSuggestion={renderSuggestion}
          renderSuggestionsContainer={({ containerProps, children }) => suggestions.length > 0 ? (
            <div {...containerProps} className="w-full p-1.5">
              {children}
            </div>
          ) : (
            <div className="flex justify-center items-center p-6 text-xs text-muted-foreground">
              No results
            </div>
          )}
          renderInputComponent={inputProps => (
            <DataModelSearchInput 
              {...inputProps} 
              selected={selected} 
              onClearSearch={onClearSearch} />
          )}
          inputProps={{
            value: query,
            onChange: (_, { newValue }) => setQuery(newValue)
          }} />
      </div>
    </form>
  )

}