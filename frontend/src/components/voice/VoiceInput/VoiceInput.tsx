import { useLanguage } from '../../../context/LanguageContext';

export default function VoiceInput() {
  const { t } = useLanguage();

  return (
    <button
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-slate-300 px-4 py-2 rounded-lg transition-colors text-sm"
      title={t('input.micHint')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
      </svg>
      {t('input.micHint')}
    </button>
  );
}
