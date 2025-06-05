import { useEffect, useState } from 'react';
import { CaseSensitive, ChevronsLeftRightEllipsis, Database, Hash, Link2, List, MapPin, Palette, Ruler, Spline } from 'lucide-react';
import { DialogDescription } from '@radix-ui/react-dialog';
import { PropertyDefinition } from '@/model';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Label';
import { Switch } from '@/ui/Switch';
import { Textarea } from '@/ui/Textarea';
import { PropertyPreview } from './PropertyPreview';
import { EnumOptions } from './EnumOptions';
import { ExternalAuthorityOptions } from './ExternalAuthorityOptions';
import { TextOptions } from './TextOptions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

interface PropertyDefinitionEditorProps {

  editorHint: string;

  previewHint: string;

  property?: PropertyDefinition;

  schema: PropertyDefinition[];

  onSave(definition: PropertyDefinition): void;

}

export const PropertyDefinitionEditor = (props: PropertyDefinitionEditorProps) => {

  const [edited, setEdited] = useState<Partial<PropertyDefinition>>(props.property || {});

  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    const { name } = edited;
    if (!name) return;

    const existingNames = new Set(
      props.schema
        .filter(p => p !== edited)
        .map(d => d.name.toLowerCase())
    );

    setNameError(existingNames.has(name.toLowerCase()));
  }, [edited.name, props.schema]);

  const onSubmit = (evt: React.FormEvent) => {
    evt.preventDefault();

    const { name, type } = edited;

    // Validate
    if (name && type && !nameError) {
      props.onSave({...edited, name: edited.name.trim() } as PropertyDefinition);
    } else {
      // TODO error handling
    }
  }

  const onCheckMultiple = (checked: boolean) => {
    if (checked)
      setEdited(definition => ({ ...definition, multiple: true }));
    else 
      setEdited(({ multiple, ...definition }) => definition);
  }

  return (
    <article className="grid grid-cols-5 rounded-lg overflow-hidden">
      <div className="px-6 py-3 col-span-3">
        <DialogDescription className="text-left text-xs leading-relaxed mt-1">
          {props.editorHint}
        </DialogDescription>

        <form onSubmit={onSubmit}>
          <div className="mt-4">
            <Label 
              htmlFor="name"
              className="inline-block text-xs mb-1.5 ml-0.5">
              Property Name
            </Label>

            {nameError && (<span className="text-xs text-red-600 ml-2">Property name already exists</span>)}

            <Input 
              id="name" 
              className="bg-white"
              value={edited.name || ''} 
              onChange={evt => setEdited(prop => ({ ...prop, name: evt.target.value }))} />
          </div>

          <div className="mt-3">
            <Label 
              htmlFor="type"
              className="inline-block text-xs mb-1.5 ml-0.5">
              Data Type
            </Label>

            <Select
              value={edited.type}
              onValueChange={t => setEdited(prop => ({ ...prop, type: t as PropertyDefinition['type']}))}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="text">
                  <CaseSensitive className="inline w-4 h-4 mr-1" /> Text
                </SelectItem>
                <SelectItem value="number">
                  <Hash className="inline w-4 h-4 mr-1.5 mb-0.5" /> Number
                </SelectItem>
                <SelectItem value="enum">
                  <List className="inline w-4 h-4 mr-1.5 mb-0.5" /> Options
                </SelectItem>
                <SelectItem value="range">
                  <ChevronsLeftRightEllipsis className="inline w-4 h-4 mr-1.5 mb-0.5" /> Number Range
                </SelectItem>
                <SelectItem value="uri">
                  <Link2 className="inline w-4 h-4 mr-1.5 mb-0.5" /> URI
                </SelectItem>
                <SelectItem value="geocoordinate">
                  <MapPin className="inline w-4 h-4 mr-1.5 mb-0.5" /> Geo-coordinates
                </SelectItem>
                <SelectItem value="measurement">
                  <Ruler className="inline w-4 h-4 mr-1.5 mb-0.5" /> Measurement
                </SelectItem>
                <SelectItem value="color">
                  <Palette className="inline w-4 h-4 mr-1.5 mb-0.5" /> Color
                </SelectItem>
                <SelectItem value="external_authority">
                  <Database className="inline w-4 h-4 mr-1.5 mb-0.5" /> External Authority
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {edited.type === 'enum' ? (
            <EnumOptions 
              definition={edited}
              onUpdate={setEdited} />
          ) : edited.type === 'external_authority' ? (
            <ExternalAuthorityOptions 
              definition={edited} 
              onUpdate={setEdited} />
          ) : edited.type === 'text' && (
            <TextOptions
              definition={edited}
              onUpdate={setEdited} />
          )}

          <div className="text-xs flex items-center pt-4 pb-4 px-0.5 gap-3">
            <Switch 
              checked={Boolean(edited.multiple)}
              onCheckedChange={onCheckMultiple}/> Allow multiple values
          </div>

          <div className="mt-3">
            <Label 
              htmlFor="description"
              className="inline-block text-xs mb-1.5 ml-0.5">Property Description</Label>

            <Textarea 
              id="description"
              className="bg-white"
              rows={3} 
              value={edited.description || ''} 
              onChange={evt => setEdited(prop => ({ ...prop, description: evt.target.value }))} />
          </div>

          <div className="mt-5 mb-3 sm:justify-start">
            <Button type="button" onClick={onSubmit}>Save Property</Button>
          </div>
        </form>
      </div>

      <PropertyPreview 
        hint={props.previewHint}
        property={edited} />
    </article>
  )

}