import { Children, ReactNode, useState } from 'react';
import ReactAutosuggest from 'react-autosuggest';
import { cn } from '@/ui/utils';

interface AutosuggestProps<T extends { id: string }> {

  id?: string;

  className?: string;

  value: string;

  getSuggestions: (query: string) => T[];

  renderSuggestion: (suggestion: T) => ReactNode;

  onChange(value: string): void;

}

export const Autosuggest = <T extends { id: string }>(props: AutosuggestProps<T>) => {
 
  const [suggestions, setSuggestions] = useState([]);

  const onGetSuggestions = ({ value }: { value: string }) =>
    setSuggestions(props.getSuggestions(value));

  const inputClass = cn(
    'flex h-9 w-full rounded-md shadow-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.className
  );

  const containerClass = 
    'react-autosuggest__suggestions-container absolute mt-1.5 w-full z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg'

  const suggestionClass =
    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground';

  const renderSuggestion = (suggestion: T, { isHighlighted }) => (
    <div className={suggestionClass} data-highlighted={isHighlighted ? 'true' : undefined}>
      {props.renderSuggestion(suggestion)}
    </div>
  )

  return (
    <ReactAutosuggest 
      suggestions={suggestions} 
      onSuggestionsFetchRequested={onGetSuggestions}
      onSuggestionsClearRequested={() => setSuggestions([])}
      getSuggestionValue={suggestion => suggestion.id}
      renderSuggestionsContainer={({ containerProps, children }) => Children.toArray(children).length > 0 ? (
        <div {...containerProps} className={containerClass}>
          {children}
        </div>
      ) : null}
      renderSuggestion={renderSuggestion}
      containerProps={{
        className: 'relative'
      }}
      inputProps={{
        className: inputClass,
        value: props.value,
        onChange: (_, { newValue }) => props.onChange(newValue)
      }} />
  )
  
}