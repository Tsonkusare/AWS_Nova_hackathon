import { useState } from 'react';
import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';
import { generateText } from '../../../services/api';

const CATEGORIES = ['hiring', 'healthcare', 'finance', 'surveillance', 'education'];

export default function TextInput() {
  const { inputText, setInputText } = useSession();
  const { t } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(category?: string) {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateText(category);
      setInputText(result.text);
    } catch {
      setError(t('input.generateError'));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={t('input.placeholder')}
        className="w-full h-40 bg-white/5 border border-white/20 text-white rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
      />
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => handleGenerate()}
          disabled={isGenerating}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? t('input.generating') : t('input.generateSample')}
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleGenerate(cat)}
            disabled={isGenerating}
            className="px-2.5 py-1 text-xs rounded-md bg-white/10 hover:bg-white/20 text-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed capitalize"
          >
            {cat}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
