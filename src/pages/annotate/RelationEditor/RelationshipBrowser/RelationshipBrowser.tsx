import { useCallback, useMemo, useState } from 'react';
import ReactAutosuggest from 'react-autosuggest';
import { ImageAnnotation } from '@annotorious/react';
import { RelationshipType } from '@/model';
import { RelationshipBrowserSuggestion } from './RelationshipBrowserSuggestion';
import { RelationshipBrowserInput } from './RelationshipBrowserInput';
import { RelationshipSearchResult, useRelationshipSearch } from './useRelationshipSearch';
import { Eye, EyeOff, Spline } from 'lucide-react';
import { Button } from '@/ui/Button';
import { RelationshipTypeEditor } from '@/components/RelationshipTypeEditor';

interface RelationshipBrowserProps {

  source: ImageAnnotation;

  target?: ImageAnnotation;

  relation: RelationshipType;

  onSelect(relation: RelationshipType): void;

}

export const RelationshipBrowser = (props: RelationshipBrowserProps) => {

  const [showNotApplicable, setShowNotApplicable] = useState(false);

  const { isApplicable, query, setQuery, results } = useRelationshipSearch(props.source, props.target);

  const applicableSuggestions = useMemo(() =>  results.filter(s => s.isApplicable), [results]);

  const [createNew, setCreateNew] = useState<Partial<RelationshipType> | undefined>(undefined);

  const onSelect = (result: RelationshipSearchResult) => {
    if (result.isApplicable)
      props.onSelect(result);
  }

  const onGetSuggestions = useCallback(({ value }: { value: string }) => {  
    setQuery(value);
  }, [setQuery]);

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

    if (type && isApplicable(type)) {
      // Select and close
      props.onSelect(type);
    }
  }

  const notApplicable = results.length - applicableSuggestions.length;

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
            <div {...containerProps} key={containerProps.key} className="w-full bg-muted">
              {children}
            </div>
          ) : (
            results.length === 0 ? (
              <div className="flex flex-col border-b justify-center items-center p-6 text-xs text-muted-foreground font-light bg-muted">
                <span>No types found.</span>
              </div>
            ) : !showNotApplicable && (
              <div className="flex flex-col justify-center items-center border-b px-2 pt-6 pb-4 text-xs bg-muted">
                <span>No applicable types found.</span>

                <Button 
                  variant="outline"
                  className="py-0.5 px-1.5 mt-3 gap-1.5 text-[11.5px] font-normal text-muted-foreground/60 h-auto hover:bg-white"
                  onClick={() => setShowNotApplicable(true)}>
                  <Eye className="h-3.5 w-3.5" strokeWidth={1.8} /> {results.length} not applicable type{results.length === 1 ? '' : 's'}
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
          <div className="bg-muted">
            <ul className={applicableSuggestions.length > 0 ? "w-full p-1 pt-0" : "w-full p-1 pt-0"}>
              <li>
                {results.filter(t => !t.isApplicable).map(t => (
                  <RelationshipBrowserSuggestion
                    key={t.name}
                    type={t} 
                    highlighted={false} />
                ))}
              </li>
            </ul>

            <div className="flex justify-center bg-muted border-b pt-3 pb-3">
              <Button
                variant="outline"
                className="py-0.5 px-1.5 gap-1.5 text-[11.5px] font-normal text-muted-foreground/60 h-auto hover:bg-white"
                onClick={() => setShowNotApplicable(false)}>
                <EyeOff className="h-3.5 w-3.5" strokeWidth={1.8} /> Hide not applicable types.
              </Button>
            </div>
          </div>
        ) : (notApplicable > 0 && applicableSuggestions.length > 0) && (
          <div className="flex justify-center bg-muted pt-3 pb-3 border-b">
            <Button 
              variant="outline"
              className="py-0.5 px-1.5 gap-1.5 text-[11.5px] font-normal text-muted-foreground/60 h-auto hover:bg-white"
              onClick={() => setShowNotApplicable(true)}>
              <Eye className="h-3.5 w-3.5" strokeWidth={1.8} /> {notApplicable} not applicable type{notApplicable === 1 ? '' : 's'}
            </Button>
          </div>
        )}
      </div>

      <div className="flex px-1 pt-2 pb-1.5 overflow-hidden">
        {(query && !results.some(t => t.name === query)) ? (
          <div className="px-1.5 py-1 flex gap-1 items-center text-[11px] text-muted-foreground overflow-hidden">
            <Spline className="h-4 w-4" /> Create
            <Button
              size="sm"
              className="block font-light border h-auto text-[11px] rounded px-1.5 py-1 whitespace-nowrap overflow-hidden text-ellipsis"
              variant="ghost"
              onClick={onCreateNew}>
              {query}
            </Button>
          </div>
        ): (
          <Button
            size="sm"
            className="px-1.5 pr-2 pt-2 pb-1.5 text-[11px] text-muted-foreground flex gap-1 h-auto overflow-hidden"
            variant="ghost"
            onClick={onCreateNew}>
            <Spline className="h-4 w-4" /> 
            Create New Type
          </Button>
        )}
      </div>

      <RelationshipTypeEditor 
        open={Boolean(createNew)} 
        relationshipType={createNew}
        onClose={onCreated} />
    </div>
  )

}