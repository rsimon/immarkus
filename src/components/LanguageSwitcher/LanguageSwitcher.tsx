import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';
import { cn } from '@/ui/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/ui/Select';

interface LanguageSwitcherProps {

  className?: string;

}

export const LanguageSwitcher = (props: LanguageSwitcherProps) => {

  const { i18n } = useTranslation();

  const current =
    SUPPORTED_LANGUAGES.find(l => i18n.language?.startsWith(l.code)) || SUPPORTED_LANGUAGES[0];

  return (
    <Select
      value={current.code}
      onValueChange={lang => i18n.changeLanguage(lang)}>
      <SelectTrigger
        className={cn(
          'h-auto bg-transparent gap-1.5 p-0 border-0 rounded-none underline underline-offset-2 text-muted-foreground shadow-none text-xs hover:text-foreground',
          props.className)}
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
