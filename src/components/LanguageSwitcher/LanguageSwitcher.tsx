import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/ui/Select';

export const LanguageSwitcher = () => {

  const { i18n } = useTranslation();

  const current =
    SUPPORTED_LANGUAGES.find(l => i18n.language?.startsWith(l.code)) || SUPPORTED_LANGUAGES[0];

  return (
    <Select
      value={current.code}
      onValueChange={lang => i18n.changeLanguage(lang)}>
      <SelectTrigger
        className="h-8 w-auto gap-1.5 border-none shadow-none text-xs text-muted-foreground hover:text-foreground"
        aria-label="Language">
        <Globe size={14} />
        <SelectValue />
      </SelectTrigger>

      <SelectContent>
        {SUPPORTED_LANGUAGES.map(({ code, label }) => (
          <SelectItem
            key={code}
            value={code}
            className="text-xs">{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

}
