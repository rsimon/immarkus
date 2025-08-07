import { useEffect, useState } from 'react';
import { TranslationResult } from './TranslationResult';
import { useDeepL } from './useDeepL';
import { useLibreTranslate } from './useLibreTranslate';
import { Separator } from '@/ui/Separator';

interface TranslationProps {

  text: string;

}

export const Translation = (props: TranslationProps) => {

  const [translated, setTranslated] = useState<TranslationResult | undefined>();

  // TODO
  const translate = useLibreTranslate();

  useEffect(() => {
    translate(props.text).then(setTranslated);
  }, [props.text, translate]);

  return translated ? (
    <div>
      <div className="p-2 text-muted-foreground/80 text-xs leading-relaxed">
        {translated.text}
      </div>

      <Separator className="mb-1" />
    </div>
  ) : null;

}