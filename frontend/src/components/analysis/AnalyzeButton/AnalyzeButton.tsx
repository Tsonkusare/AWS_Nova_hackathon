import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';
import { analyzeContent } from '../../../services/mockData';

export default function AnalyzeButton() {
  const { inputText, uploadedFile, isAnalyzing, setIsAnalyzing, setAnalysisResult } = useSession();
  const { language, t } = useLanguage();

  const hasInput = inputText.trim().length > 0 || uploadedFile !== null;

  async function handleAnalyze() {
    setIsAnalyzing(true);
    const result = await analyzeContent(language);
    setAnalysisResult(result);
    setIsAnalyzing(false);
  }

  return (
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
  );
}
