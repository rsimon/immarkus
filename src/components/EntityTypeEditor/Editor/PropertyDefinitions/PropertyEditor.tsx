import { useState } from 'react';
import { CaseSensitive, Hash, Link2, List, MapPin } from 'lucide-react';
import { X } from 'lucide-react';
import { PropertyDefinition } from '@/model';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { AddOption } from './AddOption';
import { PropertyDefinitionStub } from './PropertyDefinitionStub';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

interface PropertyEditorProps {

  property?: PropertyDefinition;

  onSave(definition: PropertyDefinition): void;

}

export const PropertyEditor = (props: PropertyEditorProps) => {

  const { property } = props;

  const [edited, setEdited] = useState<PropertyDefinitionStub>(props.property || {});

  const onAddOption = (option: string) => 
    setEdited(prop => ({
      ...prop, 
      values: [ ...(prop.values || []),  option].slice().sort()
    }));
  
  const onRemoveOption = (option: string) => () =>
    setEdited(prop => ({
      ...prop, 
      values: (prop.values || []).filter(o => o !== option)
    }));

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    const { name, type } = edited;

    // Validate
    if (name && type) {
      props.onSave(edited as PropertyDefinition);
    } else {
      // TODO error handling
    }
  }

  return (
    <form className="grid gap-2 pt-4" onSubmit={onSubmit}>
      <Label 
        htmlFor="name"
        className="text-sm">
        Name
      </Label>

      <Input 
        id="name" 
        value={edited.name || ''} 
        onChange={evt => setEdited(prop => ({ ...prop, name: evt.target.value }))} />

      <Label 
        htmlFor="type"
        className="text-sm mt-3">
        Data Type
      </Label>

      <Select
        value={edited.type}
        onValueChange={t => setEdited(prop => ({ ...prop, type: t as PropertyDefinition['type']}))}>
        <SelectTrigger className="w-full h-10">
          <SelectValue />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="text">
            <CaseSensitive className="inline w-4 h-4 mr-0.5" /> Text
          </SelectItem>
          <SelectItem value="number">
            <Hash className="inline w-3 h-3 mr-1 mb-0.5" /> Number
          </SelectItem>
          <SelectItem value="enum">
            <List className="inline w-3 h-3 mr-1 mb-0.5" /> Options
          </SelectItem>
          <SelectItem value="uri">
            <Link2 className="inline w-3 h-3 mr-1 mb-0.5" /> URI
          </SelectItem>
          <SelectItem value="geocoordinate">
            <MapPin className="inline w-3 h-3 mr-1 mb-0.5" /> Geo-coordinate
          </SelectItem>
        </SelectContent>
      </Select>

      {edited.type === 'enum' && (
        <div className="bg-muted p-2 mt-2 rounded-md">
          <div className="mt-2 mb-3 col-span-5">
            {edited.values.length === 0 ? (
              <div className="flex py-3 text-muted-foreground text-xs justify-center">
                Add at least one option.
              </div>
            ) : (
              <ul className="px-2 text-xs text-muted-foreground">
                {edited.values.map(option => (
                  <li 
                    className="flex justify-between p-1 border-b last:border-none"
                    key={option}>
                    <span>{option}</span>

                    <Button 
                      onClick={onRemoveOption(option)}
                      className="align-middle w-6 h-6"
                      variant="ghost"
                      type="button"
                      size="icon">
                      <X className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-6 gap-2"> 
            <AddOption onAddOption={onAddOption} /> 
          </div>
        </div>
      )}

      <div className="mt-3 sm:justify-start">
        <Button type="button" onClick={onSubmit}>Save</Button>
      </div>
    </form>
  )

}