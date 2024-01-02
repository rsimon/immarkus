import { Autosuggest } from '@/ui/Autosuggest';
import { useStore } from '@/store';
import { EntityType } from '@/model';

interface ParentBrowserProps {

  id?: string;

  className?: string;

  value?: string;

  onChange(value: string): void;

}

export const ParentBrowser = (props: ParentBrowserProps) => {

  const store = useStore();

  const getSuggestions = (query: string) => 
    store.searchEntityTypes(query);

  const renderSuggestion = (type: EntityType) => (
    type.label ? (
      <>{type.label} <span className="text-muted-foreground/60 ml-1.5">{type.id}</span></>
    ) : (
      <>{type.id}</>
    )
  )

  return (
    <Autosuggest 
      id={props.id}
      className={props.className}
      value={props.value}
      onChange={props.onChange}
      getSuggestions={getSuggestions}
      renderSuggestion={renderSuggestion} />
  )

}