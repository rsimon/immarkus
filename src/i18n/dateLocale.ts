import { Locale } from 'date-fns';
import { ja } from 'date-fns/locale';
import i18n from './index';

const DATE_LOCALES: Record<string, Locale> = { ja };

/** date-fns locale matching the current UI language (undefined = date-fns default, English) */
export const getDateLocale = (): Locale | undefined =>
  DATE_LOCALES[i18n.language?.split('-')[0]];
