import { RelationshipType } from '@/model';

interface RelationshipBrowserSuggestionProps {

  type: RelationshipType;

  highlighted: boolean;

}

export const RelationshipBrowserSuggestion = (props: RelationshipBrowserSuggestionProps) => {

  return (
    <div>
      {props.type.name}
    </div>
  )

}