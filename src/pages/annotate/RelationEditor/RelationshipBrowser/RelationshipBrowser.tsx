import { RelationshipType } from '@/model';
import { useState } from 'react';
import ReactAutosuggest from 'react-autosuggest';
import { RelationshipBrowserSuggestion } from './RelationshipBrowserSuggestion';
import { RelationshipBrowserInput } from './RelationshipBrowserInput';

interface RelationshipBrowserProps {

}

export const RelationshipBrowser = (props: RelationshipBrowserProps) => {

  const [query, setQuery] = useState('');

  const [selected, setSelected] = useState<RelationshipType | undefined>();

  const [suggestions, setSuggestions] = useState<RelationshipType[]>([]);

  const updateSuggestions = (value?: string) => {
    console.log('update suggestions', value);
  }

  const onGetSuggestions = ({ value }: { value: string }) => {   
    console.log('get suggestions', value);
    updateSuggestions(value);
  }

  const renderSuggestion = (type: RelationshipType, { isHighlighted }) => (
    <RelationshipBrowserSuggestion
      type={type} 
      highlighted={isHighlighted} />
  )

  const onSelect = (type: RelationshipType) => {
    setSelected(type);
    // props.onSelect(type);
  }

  return (
    <ReactAutosuggest
      alwaysRenderSuggestions
      suggestions={[]} 
      getSuggestionValue={suggestion => suggestion.name}
      onSuggestionSelected={(_, { suggestion }) => onSelect(suggestion)}
      onSuggestionsFetchRequested={onGetSuggestions}
      shouldRenderSuggestions={() => true}
      renderSuggestion={renderSuggestion}
      renderSuggestionsContainer={({ containerProps, children }) => suggestions.length > 0 ? (
        <div {...containerProps} key={containerProps.key} className="w-full px-1.5 py-2.5">
          {children}
        </div>
      ) : (
        <div className="flex justify-center items-center p-6 text-sm text-muted-foreground">
          No results
        </div>
      )}
      renderInputComponent={inputProps => (
        <RelationshipBrowserInput {...inputProps} />
      )}
      inputProps={{
        value: query,
        onChange: (_, { newValue }) => setQuery(newValue)
      }} />
  )

}