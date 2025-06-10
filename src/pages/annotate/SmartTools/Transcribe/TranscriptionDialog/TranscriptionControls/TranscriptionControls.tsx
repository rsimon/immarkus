import { useState } from 'react';
import { Button } from '@/ui/Button';
import { Label } from '@/ui/Label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

const ENGINES = [{
  name: 'OCR.space',
  description: 'Free online OCR API provided by OCR.space.'
}];

const LANGUAGES = {
  ara: 'Arabic',
  bul: 'Bulgarian',
  chs: 'Chinese (Simplified)',
  cht: 'Chinese (Traditional)',
  hrv: 'Croatian',
  cze: 'Czech',
  dan: 'Danish',
  dut: 'Dutch',
  eng: 'English',
  fin: 'Finnish',
  fre: 'French',
  ger: 'German',
  gre: 'Greek',
  hun: 'Hungarian',
  kor: 'Korean',
  ita: 'Italian',
  jpn: 'Japanese',
  pol: 'Polish',
  por: 'Portuguese',
  rus: 'Russian',
  slv: 'Slovenian',
  spa: 'Spanish',
  swe: 'Swedish',
  tha: 'Thai',
  tur: 'Turkish',
  ukr: 'Ukrainian',
  vnm: 'Vietnamese'
};

interface TranscriptionControlsProps {

  onCancel(): void;

  onSubmitImage(): void;

}

export const TranscriptionControls = (props: TranscriptionControlsProps) => {

  const [engine, setEngine] = useState(ENGINES[0]);

  const [language, setLanguage] = useState<keyof typeof LANGUAGES | ''>('');

  return (
    <div className="px-2 pt-1 flex flex-col h-full justify-between">
      <div className="space-y-8">
        <fieldset className="space-y-2">
          <Label className="font-semibold">Engine</Label>

          <Select
            value={engine.name}
            onValueChange={name => ENGINES.find(e => e.name === name)}>
            <SelectTrigger 
              className="w-full text-left h-auto text-sm border rounded shadow-xs mt-2 pl-2.5 pr-2 py-2 flex justify-between">
              <div>
                <h4 className="font-semibold">
                  {engine.name}
                </h4>
                <p className="text-xs leading-relaxed mt-0.5">
                  {engine.description}
                </p>
              </div>
            </SelectTrigger>

            <SelectContent
              align="start"
              className="">
              {ENGINES.map(e => (
                <SelectItem
                  key={e.name}
                  value={e.name}
                  className="flex items-start [&>*:first-child]:mt-0.5">
                  <h4 className="font-semibold">
                    {e.name}
                  </h4>
                  <p className="text-xs leading-relaxed mt-0.5">
                    {e.description}
                  </p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>

        <fieldset className="space-y-2">
          <Label className="font-semibold">Content Language</Label>

          <Select 
            value={language}
            onValueChange={val => setLanguage(val as keyof typeof LANGUAGES)}>
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {Object.keys(LANGUAGES).map(code => (
                <SelectItem 
                  key={code}
                  value={code}>
                  {LANGUAGES[code]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </fieldset>
      </div>

      <div className="space-y-2">
        <Button 
          className="w-full"
          onClick={props.onSubmitImage}
          disabled={!language}>
          Start OCR Processing
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={props.onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )

}