import { useEffect, useState } from 'react';
import { Button } from '@/ui/Button';
import { Label } from '@/ui/Label';
import { OCROptions, ProcessingState } from '../../Types';
import { ProcessingStateBadge } from './ProcessingStateBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { Switch } from '@/ui/Switch';

interface TranscriptionControlsProps {

  processingState?: ProcessingState;

  options: Partial<OCROptions>;

  onOptionsChanged(options: Partial<OCROptions>): void;

  onCancel(): void;

  onSubmit(): void;

}

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

export const TranscriptionControls = (props: TranscriptionControlsProps) => {

  const [engine, _] = useState(ENGINES[0]);

  const language = props.options.language || '';

  const [showProcessingState, setShowProcessingState] = useState(false);

  useEffect(() => {
    // Re-enable submit button if user changes language setting
    setShowProcessingState(false);
  }, [props.options.language]);

  useEffect(() => {
    // Show processing state instead of submit button
    setShowProcessingState(Boolean(props.processingState));
  }, [props.processingState]);

  const onChangeLanguage = (language: string) =>
    props.onOptionsChanged({ ...props.options, language });

  const onChangeMergeLines = (mergeLines: boolean) =>
    props.onOptionsChanged({ ...props.options, mergeLines });

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
            onValueChange={onChangeLanguage}>
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

        <fieldset>
          <Label className="font-semibold">OCR Options</Label>

          <div className="flex gap-3 items-start mt-3">
            <Switch 
              id="merge-lines" 
              className="mt-1" 
              checked={props.options.mergeLines} 
              onCheckedChange={onChangeMergeLines} />

            <div className="leading-relaxed">
              <Label htmlFor="merge-lines">Merge Words into Line Annotations</Label>
              <p className="text-sm text-muted-foreground pr-4">
                Create one annotation per detected text line instead of 
                separate annotations for each word.
              </p>
            </div>
          </div>
        </fieldset>
      </div>

      <div className="space-y-2">
        {showProcessingState ? (
          <ProcessingStateBadge
            processingState={props.processingState} />
        ) : (
          <Button 
            className="w-full"
            onClick={() => props.onSubmit()}
            disabled={!language}>
            Start OCR Processing
          </Button>
        )}

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