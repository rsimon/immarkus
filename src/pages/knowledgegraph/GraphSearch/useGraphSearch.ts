import { useStore } from '@/store';
import { useEffect, useState } from 'react';
import { Graph } from '../Types';
import { 
  DropdownOption, 
  NestedConditionSentence, 
  ObjectType, 
  Sentence, 
  SimpleConditionSentence 
} from './Types';
import { 
  findFoldersByMetadata, 
  findImagesByEntityClass, 
  findImagesByMetadata, 
  listAllMetadataProperties, 
  listFolderMetadataProperties, 
  listMetadataValues 
} from './searchUtils';

const ComparatorOptions = [
  { label: 'is', value: 'IS' }, 
  { label: 'is not empty', value: 'IS_NOT_EMPTY'}
];

export const useGraphSearch = (graph: Graph, objectType: ObjectType, initialValue?: Partial<Sentence>) => {

  const store = useStore();

  const [sentence, setSentence] = useState<Partial<Sentence>>(initialValue || {});

  const [matches, setMatches] = useState<string[] | undefined>();

  const [attributeOptions, setAttributeOptions] = useState<DropdownOption[]>([]);

  const [comparatorOptions, setComparatorOptions] = useState<DropdownOption[]>([]);

  const [valueOptions, setValueOptions] = useState<DropdownOption[]>([]);

  useEffect(() => {
    if (initialValue !== sentence)
      setSentence(initialValue);
  }, [objectType, initialValue]);

  const updateSentence = (part: Partial<Sentence>) =>
    setSentence(prev => ({ ...prev, ...part }));

  const resolveAttribute = (attribute: string): ['FOLDER' | 'IMAGE', string] => {
    return attribute.startsWith('folder:') 
      ? ['FOLDER', attribute.substring('folder:'.length)]
      : ['IMAGE',  attribute.substring('image:'.length)];
  }

  useEffect(() => {
    /** 
     * Decision tree logic
     */
    if (sentence.ConditionType === 'WHERE') {
      const s = sentence as SimpleConditionSentence;

      if (!s.Attribute) {
        const properties = objectType === 'FOLDER'
          ? listFolderMetadataProperties(store) : listAllMetadataProperties(store);

        setAttributeOptions(properties.map(p => {
          const value = `${p.type === 'FOLDER' ? 'folder' : 'image'}:${p.propertyName}`;
          return { label: value, value }
        }));
      } else if (!s.Comparator) {
        setComparatorOptions(ComparatorOptions);
      } else if (!s.Value && s.Comparator === 'IS') {
        // Resolve attribute
        const [type, propertyName] = resolveAttribute(s.Attribute);
        listMetadataValues(store, type, propertyName).then(propertyValues => {
          const options = propertyValues.map(label => ({ label, value: label }));
          setValueOptions(options);
        });
      } else {
        const [type, propertyName] = resolveAttribute(s.Attribute);
        const value = s.Comparator === 'IS_NOT_EMPTY' ? undefined : s.Value;

        if (objectType === 'IMAGE') {
          findImagesByMetadata(store, type, propertyName, value).then(results =>
            setMatches(results.map(image => image.id)));  
        } else {
          findFoldersByMetadata(store, propertyName, value).then(results =>
            setMatches(results.map(folder => folder.id)));
        }
      }
    } else if (sentence.ConditionType === 'ANNOTATED_WITH') {
      const s = sentence as NestedConditionSentence;

      console.log('annotated with', s);

      if (!s.Value) {
        const { entityTypes } = store.getDataModel();
        const options = entityTypes.map(t => ({ value: t.id, label: t.label || t.id }));
        setValueOptions(options);
      } else {
        const imageNodes = findImagesByEntityClass(store, graph, s.Value);
        setMatches(imageNodes.map(n => n.id));
      }
    }
  }, [graph, objectType, sentence]);

  return {
    attributeOptions,
    comparatorOptions,
    matches,
    sentence, 
    updateSentence,
    valueOptions
  }
  
}