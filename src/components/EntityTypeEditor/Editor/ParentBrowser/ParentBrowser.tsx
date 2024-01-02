import { Children, useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { cn } from '@/ui/utils';
import { useStore } from '@/store';
import { EntityType } from '@/model';

interface ParentBrowserProps {

  id: string;

  className?: string;

  value?: string;

  onChange(value: string): void;

}

export const ParentBrowser = (props: ParentBrowserProps) => {

  const store = useStore();

  const [suggestions, setSuggestions] = useState([]);

  const onGetSuggestions = ({ value }: { value: string }) =>
    setSuggestions(store.searchEntityTypes(value));

  const inputClass = cn(
    'flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    props.className
  );

  const containerClass = 
    'react-autosuggest__suggestions-container absolute mt-1.5 w-full z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg'

  const suggestionClass =
    'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground';

  const renderSuggestion = (type: EntityType, { isHighlighted }) => (
    <div className={suggestionClass} data-highlighted={isHighlighted ? 'true' : undefined}>
      {type.label ? (
        <>{type.label} <span className="text-muted-foreground/60 ml-1.5">{type.id}</span></>
      ) : (
        <>{type.id}</>
      )}
    </div>
  )

  return (
    <Autosuggest 
      suggestions={suggestions} 
      onSuggestionsFetchRequested={onGetSuggestions}
      onSuggestionsClearRequested={() => setSuggestions([])}
      getSuggestionValue={type => type.id}
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