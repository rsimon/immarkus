import { useCallback, useState } from 'react';
import ReactAutosuggest from 'react-autosuggest';
import { ImageAnnotation } from '@annotorious/react';
import { RelationshipType } from '@/model';
import { RelationshipBrowserSuggestion } from './RelationshipBrowserSuggestion';
import { RelationshipBrowserInput } from './RelationshipBrowserInput';
import { useRelationshipSearch } from './useRelationshipSearch';

interface RelationshipBrowserProps {

  source: ImageAnnotation;

  target?: ImageAnnotation;

}

export const RelationshipBrowser = (props: RelationshipBrowserProps) => {

  const [query, setQuery] = useState('');

  const [suggestions, setSuggestions] = useState<RelationshipType[]>([]);

  const { search } = useRelationshipSearch(props.source, props.target);

  const onGetSuggestions = useCallback(({ value }: { value: string }) => {   
    const suggestions = search(query);
    setSuggestions(suggestions);
  }, [search]);

  const renderSuggestion = (type: RelationshipType, { isHighlighted }) => (
    <RelationshipBrowserSuggestion
      type={type} 
      highlighted={isHighlighted} />
  )

  const onSelect = (type: RelationshipType) => {
    // props.onSelect(type);
  }

  return (
    <ReactAutosuggest
      alwaysRenderSuggestions
      suggestions={suggestions} 
      getSuggestionValue={suggestion => suggestion.name}
      onSuggestionSelected={(_, { suggestion }) => onSelect(suggestion)}
      onSuggestionsFetchRequested={onGetSuggestions}
      shouldRenderSuggestions={() => true}
      renderSuggestion={renderSuggestion}
      renderSuggestionsContainer={({ containerProps, children }) => suggestions.length > 0 ? (
        <div {...containerProps} key={containerProps.key} className="w-full p-1">
          {children}
        </div>
      ) : (
        <div className="flex justify-center items-center p-6 text-sm text-muted-foreground">
          No results
        </div>
      )}
      renderInputComponent={inputProps => (
        <RelationshipBrowserInput 
          {...inputProps} 
          key={'key' in inputProps ? inputProps.key as string : undefined} />
      )}
      inputProps={{
        value: query,
        onChange: (_, { newValue }) => setQuery(newValue)
      }} />
  )

}