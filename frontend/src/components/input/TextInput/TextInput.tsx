import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function TextInput() {
  const { inputText, setInputText } = useSession();
  const { t } = useLanguage();

  return (
    <textarea
      value={inputText}
      onChange={(e) => setInputText(e.target.value)}
      placeholder={t('input.placeholder')}
      className="w-full h-40 bg-white/5 border border-white/20 text-white rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
    />
  );
}
