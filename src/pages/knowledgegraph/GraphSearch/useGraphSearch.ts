import { useStore } from '@/store';
import { useEffect, useState } from 'react';
import { DropdownOption, SchemaPropertyDefinition, Sentence, SimpleConditionSentence } from './Types';
import { listAllMetadataProperties } from './searchUtils';

const ComparatorOptions = [
  { label: 'is', value: 'IS' }, 
  { label: 'is not empty', value: 'IS_NOT_EMPTY'}
];

export const useGraphSearch = () => {

  const store = useStore();

  const [sentence, setSentence] = useState<Partial<Sentence<any>>>({});

  const [attributeOptions, setAttributeOptions] = useState<DropdownOption<SchemaPropertyDefinition>[]>([]);

  const [comparatorOptions, setComparatorOptions] = useState<DropdownOption<any>[]>([]);

  const updateSentence = (part: Partial<Sentence<any>>) => {
    setSentence(prev => ({ ...prev, ...part }));
  };

  useEffect(() => {
    // Decision tree logic
    if (sentence.ObjectType === 'IMAGE') {
      if (sentence.ConditionType === 'IN_FOLDERS_WHERE') {
        const s = sentence as SimpleConditionSentence<any>;
        if (!s.Attribute) {
          const properties = listAllMetadataProperties(store);
          setAttributeOptions(properties.map(p => 
            ({ label: `${p.type === 'FOLDER' ? 'folder' : 'image'}:${p.property.name}`, value: p })));
        } else if (!s.Comparator) {
          setComparatorOptions(ComparatorOptions);
        }
      }
    } else {
      // TODO      
    }
  }, [sentence]);

  return {
    attributeOptions,
    comparatorOptions,
    sentence, 
    updateSentence
  }
  
}