import { Autosuggest } from '@/ui/Autosuggest';
import { useDataModel } from '@/store';
import { EntityType } from '@/model';

interface ParentBrowserProps {

  id?: string;

  tabIndex?: number;

  className?: string;

  value?: string;

  onChange(value: string): void;

}

export const ParentBrowser = (props: ParentBrowserProps) => {

  const model = useDataModel();

  const getSuggestions = (query: string) => 
    model.searchEntityTypes(query);

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
      tabIndex={props.tabIndex}
      className={props.className}
      value={props.value}
      onChange={props.onChange}
      getSuggestions={getSuggestions}
      renderSuggestion={renderSuggestion} />
  )

}