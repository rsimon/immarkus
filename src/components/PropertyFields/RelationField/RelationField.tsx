import { useEffect, useState } from 'react';
import { RelationPropertyDefinition } from '@/model';
import { cn } from '@/ui/utils';
import { BasePropertyField } from '../BasePropertyField';
import { Autosuggest } from '@/ui/Autosuggest';
import { useEntityInstanceSearch } from './useAnnotationSearch';
import { useDataModel } from '@/store';

interface RelationFieldProps {

  id: string;

  className?: string;

  definition: RelationPropertyDefinition;

  value?: string;

  onChange?(value: string): void;

}

export const RelationField = (props: RelationFieldProps) => {
  
  const [value, setValue] = useState(props.value);

  const className = cn(props.className, 'mt-0.5');

  const datamodel = useDataModel();

  const entityType = datamodel.getEntityType(props.definition.targetType);

  useEffect(() => {
    if (props.onChange)
      props.onChange(value);
  }, [value, props.onChange]);

  const search = useEntityInstanceSearch({ 
    type: props.definition.targetType,
    field: props.definition.labelProperty
  });

  const getSuggestions = (query: string) => 
    search.initialized 
      ? search.searchEntityInstances(query).map(id => ({ id }))
      : [];

  const renderSuggestion = ({ id }) => id;

  return (
    <BasePropertyField 
      id={props.id}
      definition={props.definition}>

      <Autosuggest 
        id={props.id}
        disabled={!search.initialized}
        className={className}
        value={value}
        placeholder={entityType && `Search '${entityType.label || entityType.id}' annotations...`}
        onChange={setValue}
        getSuggestions={getSuggestions}
        renderSuggestion={renderSuggestion} />
    </BasePropertyField>
  );

}