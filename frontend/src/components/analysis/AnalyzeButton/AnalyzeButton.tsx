import { useState } from 'react';
import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';
import { analyzeText, analyzeFile } from '../../../services/api';

export default function AnalyzeButton() {
  const { inputText, uploadedFile, isAnalyzing, setIsAnalyzing, setAnalysisResult } = useSession();
  const { language, t } = useLanguage();
  const [error, setError] = useState<string | null>(null);

  const hasInput = inputText.trim().length > 0 || uploadedFile !== null;

  async function handleAnalyze() {
    setIsAnalyzing(true);
    setError(null);
    try {
      let result;
      if (uploadedFile) {
        result = await analyzeFile(uploadedFile, language);
      } else {
        result = await analyzeText(inputText, language);
      }
      setAnalysisResult(result);
    } catch (err) {
      setError(t('input.backendError'));
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleAnalyze}
        disabled={!hasInput || isAnalyzing}
        className={`w-full py-3 rounded-lg font-medium transition-colors ${
          hasInput && !isAnalyzing
            ? 'bg-blue-600 hover:bg-blue-500 text-white'
            : 'bg-white/10 text-slate-500 cursor-not-allowed'
        }`}
      >
        {isAnalyzing ? t('input.analyzing') : t('input.analyze')}
      </button>
      {error && (
        <p className="text-red-400 text-sm text-center">{error}</p>
      )}
    </div>
  );
}
