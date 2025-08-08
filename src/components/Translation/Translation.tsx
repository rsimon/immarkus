import { useEffect, useState } from 'react';
import { TranslationResult } from './TranslationResult';
import { useDeepL } from './useDeepL';
import { useLibreTranslate } from './useLibreTranslate';
import { Separator } from '@/ui/Separator';
import { useGoogleTranslate } from './useGoogleTranslate';

interface TranslationProps {

  text: string;

}

export const Translation = (props: TranslationProps) => {

  const [translated, setTranslated] = useState<TranslationResult | undefined>();

  // TODO
  const translate = useDeepL('my-api-key')
  // const translate = useGoogleTranslate();

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