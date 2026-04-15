import { useUIStore } from '../store/useUIStore';
import { translations, TranslationKey } from '../i18n';

export function useT() {
  const language = useUIStore((s) => s.language);
  const dict = translations[language] ?? translations.en;
  return (key: TranslationKey): string => dict[key] ?? key;
}
