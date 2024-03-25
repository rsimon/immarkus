import { useState } from 'react';
import { RelationPropertyDefinition } from '@/model';
import { cn } from '@/ui/utils';
import { BasePropertyField } from '../BasePropertyField';
import { Autosuggest } from '@/ui/Autosuggest';
import { useEntityInstanceSearch } from './useAnnotationSearch';

interface RelationFieldProps {

  id: string;

  className?: string;

  definition: RelationPropertyDefinition;

  value?: string;

  onChange?(value: string): void;

}

export const RelationField = (props: RelationFieldProps) => {

  const [value, setValue] = useState('');
  
  const className = cn(props.className, 'mt-0.5');

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
        onChange={setValue}
        getSuggestions={getSuggestions}
        renderSuggestion={renderSuggestion} />
    </BasePropertyField>
  );

}