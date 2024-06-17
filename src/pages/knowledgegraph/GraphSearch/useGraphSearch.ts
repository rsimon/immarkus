import { useStore } from '@/store';
import { useEffect, useState } from 'react';
import { DropdownOption, Sentence, SimpleConditionSentence } from './Types';
import { findImages, listAllMetadataProperties, listMetadataValues } from './searchUtils';
import { resolve } from 'path';

const ComparatorOptions = [
  { label: 'is', value: 'IS' }, 
  { label: 'is not empty', value: 'IS_NOT_EMPTY'}
];

export const useGraphSearch = () => {

  const store = useStore();

  const [sentence, setSentence] = useState<Partial<Sentence>>({});

  const [attributeOptions, setAttributeOptions] = useState<DropdownOption[]>([]);

  const [comparatorOptions, setComparatorOptions] = useState<DropdownOption[]>([]);

  const [valueOptions, setValueOptions] = useState<DropdownOption[]>([]);

  const updateSentence = (part: Partial<Sentence>) =>
    setSentence(prev => ({ ...prev, ...part }));

  const resolveAttribute = (attribute: string): ['FOLDER' | 'IMAGE', string] => {
    return attribute.startsWith('folder:') 
      ? ['FOLDER', attribute.substring('folder:'.length)]
      : ['IMAGE',  attribute.substring('image:'.length)];
  }

  useEffect(() => {
    console.log('sentence:', sentence);

    // Decision tree logic
    if (sentence.ObjectType === 'IMAGE') {
      if (sentence.ConditionType === 'IN_FOLDERS_WHERE') {
        const s = sentence as SimpleConditionSentence;
        if (!s.Attribute) {
          const properties = listAllMetadataProperties(store);
          setAttributeOptions(properties.map(p => {
            const value = `${p.type === 'FOLDER' ? 'folder' : 'image'}:${p.propertyName}`;
            return { label: value, value }
          }));
        } else if (!s.Comparator) {
          setComparatorOptions(ComparatorOptions);
        } else if (!s.Value) {
          // Resolve attribute
          const [type, propertyName] = resolveAttribute(s.Attribute);
          listMetadataValues(store, type, propertyName).then(propertyValues => {
            const options = propertyValues.map(v => ({ label: v.toString(), value: v }));
            setValueOptions(options);
          });
        } else {
          // For debugging purposes
          const [type, propertyName] = resolveAttribute(s.Attribute);
          findImages(store, type, propertyName, s.Value).then(results => {
            console.log('results', results);
          })
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
    setSentence,
    updateSentence,
    valueOptions
  }
  
}