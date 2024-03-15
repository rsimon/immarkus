import { useEffect, useState } from 'react';
import ReactAutosuggest from 'react-autosuggest';
import type { EntityType } from '@/model';
import { useDataModel } from '@/store';
import { DataModelSearchInput } from './DataModelSearchInput';
import { DataModelSearchSuggestion } from './DataModelSearchSuggestion';

import './DataModelSearch.css';

interface DataModelSearchProps {

  onSelect(type: EntityType): void;

  onConfirm(type: EntityType): void;

}

export const DataModelSearch = (props: DataModelSearchProps) => {

  const datamodel = useDataModel();

  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState<EntityType | undefined>();

  const [suggestions, setSuggestions] = useState<EntityType[]>([]);

  const updateSuggestions = (value?: string) => {
    if (selected) {
      // There is a selected class - search in branch or show all
      if (value)
        setSuggestions(datamodel.searchEntityTypeBranch(value, selected.id));
      else
        setSuggestions(datamodel.getChildTypes(selected.id));
    } else {
      // No selection - search all or show root classes
      if (value)
        setSuggestions(datamodel.searchEntityTypes(value))
      else
        setSuggestions(datamodel.getRootTypes())
    }
  }

  // Re-render suggestions if the data model changed
  useEffect(() => { 
    updateSuggestions(query);
  }, [datamodel.entityTypes]);

  const onGetSuggestions = ({ value }: { value: string }) => {   
    updateSuggestions(value);
  }

  const renderSuggestion = (type: EntityType, { isHighlighted }) => (
    <DataModelSearchSuggestion 
      type={type} 
      highlighted={isHighlighted} />
  )

  const onSelect = (type: EntityType) => {
    setSelected(type);
    props.onSelect(type);

    const hasChildren = datamodel.hasChildTypes(type.id);
    if (!hasChildren)
      props.onConfirm(type);
  }

  const onSubmitForm = (evt: React.FormEvent) => {
    evt.preventDefault();

    const type = datamodel.getEntityType(query);
    if (type)
      onSelect(type);
  }

  // After the selection changed, clear the query and update suggestions
  useEffect(() => {
    setQuery('');

    if (selected)
      setSuggestions(datamodel.getChildTypes(selected.id))
    else
      setSuggestions(datamodel.getRootTypes());
  }, [ selected ]);

  const onClearSearch = () => {
    setQuery('');
    setSelected(undefined);
  }

  return (
    <form 
      onSubmit={onSubmitForm}>
      <div className="text-sm">
        <ReactAutosuggest 
          alwaysRenderSuggestions
          suggestions={suggestions} 
          getSuggestionValue={suggestion => suggestion.id}
          onSuggestionSelected={(_, { suggestion }) => onSelect(suggestion)}
          onSuggestionsFetchRequested={onGetSuggestions}
          shouldRenderSuggestions={() => true}
          renderSuggestion={renderSuggestion}
          renderSuggestionsContainer={({ containerProps, children }) => suggestions.length > 0 ? (
            <div {...containerProps} className="w-full px-1.5 py-2.5">
              {children}
            </div>
          ) : (
            <div className="flex justify-center items-center p-6 text-sm text-muted-foreground">
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