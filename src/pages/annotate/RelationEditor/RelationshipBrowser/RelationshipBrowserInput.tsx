import { Search } from 'lucide-react';
import { RenderInputComponentProps } from 'react-autosuggest';

interface RelationshipBrowserInputProps extends RenderInputComponentProps  {

  // For future extensions...

}

export const RelationshipBrowserInput = (props: RelationshipBrowserInputProps) => {

  const { ...inputProps } = props;

  return (
    <div className="flex border-b items-center py-1.5 px-1 text-xs">
      <Search className="w-8 h-4 px-2 text-muted-foreground" />

      <input 
        autoFocus
        {...inputProps}
        placeholder="Search..."
        className="relative top-[1px] py-1 outline-none px-0.5 flex-grow" />
    </div>
  )

}