import { useTranslation } from './useTranslation';
import { SUPPORTED_LANGUAGES, type Language } from './languages';

interface LanguageSelectProps {
  id?: string;
  className?: string;
  variant?: 'light' | 'dark';
}

export function LanguageSelect({ id, className = '', variant = 'light' }: LanguageSelectProps) {
  const { language, setLanguage, t } = useTranslation();
  return (
    <select
      id={id}
      value={language}
      onChange={(event) => setLanguage(event.target.value as Language)}
      aria-label={t('demo.switch_lang')}
      className={`min-h-10 rounded-lg border px-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${variant === 'dark' ? 'border-white/20 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-800'} ${className}`}
    >
      {SUPPORTED_LANGUAGES.map(({ code, label }) => (
        <option key={code} value={code}>{label}</option>
      ))}
    </select>
  );
}
