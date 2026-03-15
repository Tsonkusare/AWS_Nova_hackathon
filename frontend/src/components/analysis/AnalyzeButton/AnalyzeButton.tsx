import { useState, useEffect, useRef } from 'react';
import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';
import { analyzeText, analyzeFile, batchTranslate } from '../../../services/api';
import type { AnalysisResult } from '../../../types';

export default function AnalyzeButton() {
  const { inputText, uploadedFile, isAnalyzing, setIsAnalyzing, setAnalysisResult, analysisResult } = useSession();
  const { language, t } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const prevLangRef = useRef(language);

  const hasInput = inputText.trim().length > 0 || uploadedFile !== null;

  // Translate existing results when language changes
  useEffect(() => {
    const prevLang = prevLangRef.current;
    prevLangRef.current = language;

    if (prevLang !== language && analysisResult) {
      translateResults(analysisResult, prevLang, language);
    }
  }, [language]);

  async function translateResults(result: AnalysisResult, fromLang: string, toLang: string) {
    try {
      // Collect all texts into one array for a single batch call
      const allTexts: string[] = [result.explanation];
      for (const issue of result.issues) {
        allTexts.push(issue.title, issue.description);
      }
      for (const rec of result.recommendations) {
        allTexts.push(rec.title, rec.description);
      }
      for (const bill of result.relevantBills || []) {
        allTexts.push(bill.snippet);
      }

      const translated = await batchTranslate(allTexts, fromLang, toLang);

      // Unpack translated texts back into the result structure
      let idx = 0;
      const newExplanation = translated[idx++];
      const newIssues = result.issues.map((issue) => ({
        title: translated[idx++],
        description: translated[idx++],
        severity: issue.severity,
      }));
      const newRecs = result.recommendations.map(() => ({
        title: translated[idx++],
        description: translated[idx++],
      }));
      const newBills = (result.relevantBills || []).map((bill) => ({
        ...bill,
        snippet: translated[idx++],
      }));

      setAnalysisResult({
        ...result,
        explanation: newExplanation,
        issues: newIssues,
        recommendations: newRecs,
        relevantBills: newBills,
      });
    } catch {
      // silently fail — keep existing results
    }
  }

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
