import { useStore } from '@/store';
import { useEffect, useState } from 'react';
import { DropdownOption, Sentence, SimpleConditionSentence } from './Types';
import { findImages, listAllMetadataProperties, listMetadataValues } from './searchUtils';

const ComparatorOptions = [
  { label: 'is', value: 'IS' }, 
  { label: 'is not empty', value: 'IS_NOT_EMPTY'}
];

export const useGraphSearch = (initialValue?: Partial<Sentence>) => {

  const store = useStore();

  const [sentence, setSentence] = useState<Partial<Sentence>>(initialValue || {});

  const [matches, setMatches] = useState<string[] | undefined>();

  const [attributeOptions, setAttributeOptions] = useState<DropdownOption[]>([]);

  const [comparatorOptions, setComparatorOptions] = useState<DropdownOption[]>([]);

  const [valueOptions, setValueOptions] = useState<DropdownOption[]>([]);

  useEffect(() => {
    if (initialValue !== sentence)
      setSentence(initialValue);
  }, [initialValue]);

  const updateSentence = (part: Partial<Sentence>) =>
    setSentence(prev => ({ ...prev, ...part }));

  const resolveAttribute = (attribute: string): ['FOLDER' | 'IMAGE', string] => {
    return attribute.startsWith('folder:') 
      ? ['FOLDER', attribute.substring('folder:'.length)]
      : ['IMAGE',  attribute.substring('image:'.length)];
  }

  useEffect(() => {
    // Decision tree logic
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
        const [type, propertyName] = resolveAttribute(s.Attribute);
        findImages(store, type, propertyName, s.Value).then(results => {
          setMatches(results.map(image => image.id));
        })
      }
    }
  }, [sentence]);

  return {
    attributeOptions,
    comparatorOptions,
    matches,
    sentence, 
    updateSentence,
    valueOptions
  }
  
}