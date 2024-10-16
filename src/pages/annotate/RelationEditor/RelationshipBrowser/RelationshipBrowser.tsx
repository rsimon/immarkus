import { useCallback, useMemo, useState } from 'react';
import ReactAutosuggest from 'react-autosuggest';
import { ImageAnnotation } from '@annotorious/react';
import { RelationshipType } from '@/model';
import { RelationshipBrowserSuggestion } from './RelationshipBrowserSuggestion';
import { RelationshipBrowserInput } from './RelationshipBrowserInput';
import { RelationshipSearchResult, useRelationshipSearch } from './useRelationshipSearch';
import { Spline } from 'lucide-react';
import { Button } from '@/ui/Button';
import { RelationshipTypeEditor } from '@/components/RelationshipTypeEditor';

interface RelationshipBrowserProps {

  source: ImageAnnotation;

  target?: ImageAnnotation;

  relation: RelationshipType;

  onSelect(relation: RelationshipType): void;

}

export const RelationshipBrowser = (props: RelationshipBrowserProps) => {

  const [query, setQuery] = useState('');

  const [suggestions, setSuggestions] = useState<RelationshipSearchResult[]>([]);

  const [showNotApplicable, setShowNotApplicable] = useState(false);

  const applicableSuggestions = useMemo(() =>  suggestions.filter(s => s.isApplicable), [suggestions]);

  const { search } = useRelationshipSearch(props.source, props.target);

  const [createNew, setCreateNew] = useState<Partial<RelationshipType> | undefined>(undefined);

  const onSelect = (result: RelationshipSearchResult) => {
    if (result.isApplicable)
      props.onSelect(result);
  }

  const onGetSuggestions = useCallback(({ value }: { value: string }) => {   
    const suggestions = search(value);
    setSuggestions(suggestions);
  }, [search]);

  const renderSuggestion = (type: RelationshipSearchResult, { isHighlighted }) => (
    <RelationshipBrowserSuggestion
      type={type} 
      highlighted={isHighlighted} />
  );

  const onCreateNew = () => {
    if (query)
      setCreateNew({ name: query });
    else
      setCreateNew({});
  }

  const onCreated = (type?: RelationshipType) => {
    setCreateNew(undefined);

    if (type) {
      // Check if valid
      props.onSelect(type);
    }
  }

  const notApplicable = suggestions.length - applicableSuggestions.length;

  return (
    <div>
      <div>
        <ReactAutosuggest
          alwaysRenderSuggestions
          focusInputOnSuggestionClick={false}
          suggestions={applicableSuggestions} 
          getSuggestionValue={suggestion => suggestion.name}
          onSuggestionSelected={(_, { suggestion }) => onSelect(suggestion)}
          onSuggestionsFetchRequested={onGetSuggestions}
          shouldRenderSuggestions={() => true}
          renderSuggestion={renderSuggestion}
          renderSuggestionsContainer={({ containerProps, children }) => applicableSuggestions.length > 0 ? (
            <div {...containerProps} key={containerProps.key} className="w-full p-1">
              {children}
            </div>
          ) : (
            suggestions.length === 0 ? (
              <div className="flex flex-col justify-center items-center p-6 text-xs text-muted-foreground font-light bg-muted">
                <span>No types found.</span>
              </div>
            ) : !showNotApplicable && (
              <div className="flex flex-col justify-center items-center p-6 text-xs bg-muted">
                <span>No applicable types found.</span>

                <Button
                  size="sm"
                  className="text-[11.5px] whitespace-nowrap font-normal text-muted-foreground bg-transparent h-auto py-0.5 px-2 mt-2"
                  variant="link"
                  onClick={() => setShowNotApplicable(true)}>
                  {suggestions.length} not applicable
                </Button>
              </div>
            )
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

        {(showNotApplicable && notApplicable > 0) ? (
          <div>
            <ul>
            <li>
                {suggestions.filter(t => !t.isApplicable).map(t => (
                  <RelationshipBrowserSuggestion
                    key={t.name}
                    type={t} 
                    highlighted={false} />
                ))}
              </li>
            </ul>

            <div className="flex justify-center bg-muted border-t">
              <Button
                variant="link"
                className="text-[11.5px] font-normal text-muted-foreground"
                onClick={() => setShowNotApplicable(false)}>
                Hide not applicable types.
              </Button>
            </div>
          </div>
        ) : (notApplicable > 0 && applicableSuggestions.length > 0) && (
          <div className="flex justify-center bg-muted border-t">
            <Button 
              variant="link"
              className="text-[11.5px] font-normal text-muted-foreground"
              onClick={() => setShowNotApplicable(true)}>
              {notApplicable} not applicable type{notApplicable === 1 ? '' : 's'}
            </Button>
          </div>
        )}
      </div>

      <div className="flex p-1 border-t overflow-hidden">
        <Button
          size="sm"
          className="px-1.5 pr-2 py-1 text-xs text-muted-foreground flex gap-1 h-auto overflow-hidden"
          variant="ghost"
          onClick={onCreateNew}>
          <Spline className="h-4 w-4" /> 
          Create {(query && !suggestions.some(t => t.name === query)) ? (
            <span className="font-light border rounded px-1.5 py-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{query}</span>
          ) : 'New Type'}
        </Button>
      </div>

      <RelationshipTypeEditor 
        open={Boolean(createNew)} 
        relationshipType={createNew}
        onClose={onCreated} />
    </div>
  )

}