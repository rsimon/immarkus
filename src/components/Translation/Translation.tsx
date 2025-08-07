import { useEffect, useState } from 'react';
import { TranslationResult } from './TranslationResult';
import { useDeepL } from './useDeepL';

interface TranslationProps {

  text: string;

}

export const Translation = (props: TranslationProps) => {

  const [translated, setTranslated] = useState<TranslationResult | undefined>();

  // TODO
  const translate = useDeepL('my-api-key');

  useEffect(() => {
    translate(props.text).then(setTranslated);
  }, [props.text, translate]);

  return translated ? (
    <div>
      {translated.text}
    </div>
  ) : null;

}