import { useStore } from '@/store';
import { useEffect, useState } from 'react';
import { W3CAnnotation } from '@annotorious/react';
import { Image } from '@/model';
import { 
  DropdownOption, 
  Graph,
  NestedConditionSentence, 
  ObjectType, 
  Sentence, 
  SimpleConditionSentence 
} from '../Types';
import { 
  findFoldersByMetadata, 
  findImagesByEntityClass, 
  findImagesByEntityConditions, 
  findImagesByMetadata, 
  findImagesByNote, 
  findImagesByRelationship, 
  listAllMetadataProperties, 
  listAllNotes, 
  listFolderMetadataProperties, 
  listMetadataValues 
} from './searchUtils';

const ComparatorOptions = [
  { label: 'is', value: 'IS' }, 
  { label: 'is not empty', value: 'IS_NOT_EMPTY'}
];

export const useGraphSearch = (
  annotations: { image: Image, annotations: W3CAnnotation[] }[],
  graph: Graph, 
  objectType: ObjectType, 
  initialValue?: Partial<Sentence>
) => {
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

  // This is a horrible hack... but well, the customer is always right
  const resolveAttribute = (attribute: DropdownOption): ['FOLDER' | 'IMAGE', string] => {
    if (attribute.builtIn) {
      return attribute.value.startsWith('folder')
        ? ['FOLDER', attribute.value]
        : ['IMAGE',  attribute.value];
    } else {
      return attribute.value.startsWith('folder:') 
        ? ['FOLDER', attribute.value.substring('folder:'.length)]
        : ['IMAGE',  attribute.value.substring('image:'.length)];
    }
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
          const value = p.builtIn 
            ? p.propertyName
            : `${p.type === 'FOLDER' ? 'folder' : 'image'}:${p.propertyName}`;
            
          return { label: value, value, builtIn: p.builtIn }
        }));
      } else if (!s.Comparator) {
        setComparatorOptions(ComparatorOptions);
      } else if (!s.Value && s.Comparator === 'IS') {
        // Resolve attribute
        const [type, propertyName] = resolveAttribute(s.Attribute);
        listMetadataValues(store, type, propertyName, s.Attribute.builtIn).then(propertyValues => {
          const options = propertyValues.map(label => ({ label, value: label }));
          setValueOptions(options);
        });
      } else {
        const [type, propertyName] = resolveAttribute(s.Attribute);
        const value = s.Comparator === 'IS_NOT_EMPTY' ? undefined : s.Value.value;

        if (objectType === 'IMAGE') {
          findImagesByMetadata(store, type, propertyName, value, s.Attribute.builtIn).then(results =>
            setMatches(results.map(image => image.id)));  
        } else {
          findFoldersByMetadata(store, propertyName, value, s.Attribute.builtIn).then(results =>
            setMatches(results.map(folder => folder.id)));
        }
      }
    } else if (sentence.ConditionType === 'WITH_ENTITY') {
      const s = sentence as NestedConditionSentence;

      if (!s.Value) {
        const { entityTypes } = store.getDataModel();
        const options = entityTypes.map(t => ({ value: t.id, label: t.label || t.id }));
        setValueOptions(options);
      } else if ((s.SubConditions || []).length === 0) {
        const imageNodes = findImagesByEntityClass(store, graph, s.Value.value);
        setMatches(imageNodes.map(n => n.id));
      } else {
        const images = findImagesByEntityConditions(store, annotations, s.Value.value, s.SubConditions);
        setMatches(images.map(i => i.id));
      }
    } else if (sentence.ConditionType === 'WITH_NOTE') {
      if (!sentence.Value) {
        const notes = listAllNotes(annotations);
        setValueOptions(notes.map(n => ({ label: n, value: n })));
      } else {
        const imageIds = findImagesByNote(annotations, sentence.Value.value);
        setMatches(imageIds);
      }
    } else if (sentence.ConditionType === 'WITH_RELATION') {
      if (!sentence.Value) {
        const relations = store.listAllRelations();

        const distinctRelationships = relations.reduce<string[]>((all, [_, meta]) => {
          const val = meta?.body?.value;
          return (val && !all.includes(val)) ? [...all, val] : all;
        }, []).map(v => ({ label: v, value: v }));

        setValueOptions(distinctRelationships);
      } else {
        findImagesByRelationship(store, sentence.Value.value).then(setMatches);
      }
    }
  }, [annotations, graph, objectType, sentence]);

  return {
    attributeOptions,
    comparatorOptions,
    matches,
    sentence, 
    updateSentence,
    valueOptions
  }
  
}