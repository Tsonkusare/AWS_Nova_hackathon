import { useState, useRef, useEffect } from 'react';
import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';
import { generateText, translateText } from '../../../services/api';

const CATEGORIES = ['hiring', 'healthcare', 'finance', 'surveillance', 'education'];

const SUPPORTED_LANGS = ['en', 'es', 'de', 'it', 'fr'];

const LANG_MARKERS: Record<string, string[]> = {
  en: ['the', 'and', 'is', 'are', 'was', 'were', 'have', 'has', 'been', 'will', 'would', 'could', 'should', 'that', 'this', 'with', 'from', 'they', 'their', 'which', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'between', 'does', 'did', 'doing', 'each', 'because', 'these', 'those', 'than', 'been', 'its', 'only', 'other'],
  es: ['el', 'la', 'los', 'las', 'del', 'que', 'por', 'para', 'con', 'una', 'como', 'pero', 'más', 'este', 'esta', 'también', 'puede', 'sobre', 'todo', 'tiene', 'ser', 'están', 'después', 'año', 'años', 'muy', 'ya', 'cuando', 'desde', 'entre', 'así', 'nos', 'durante', 'según', 'está', 'había'],
  fr: ['le', 'la', 'les', 'des', 'une', 'dans', 'pour', 'que', 'qui', 'sur', 'est', 'pas', 'avec', 'sont', 'plus', 'mais', 'par', 'ont', 'ses', 'cette', 'comme', 'peut', 'tout', 'fait', 'aussi', 'nous', 'être', 'même', 'autre', 'après', 'très', 'entre', 'donc', 'où', 'leur', 'encore', 'quelque', 'sous', 'alors'],
  de: ['der', 'die', 'das', 'und', 'ist', 'ein', 'eine', 'für', 'mit', 'auf', 'den', 'von', 'sich', 'des', 'dem', 'nicht', 'werden', 'kann', 'sind', 'wird', 'auch', 'als', 'nach', 'wie', 'oder', 'aber', 'über', 'dass', 'noch', 'bei', 'nur', 'aus', 'wenn', 'hat', 'alle', 'diese', 'haben', 'mehr', 'wurde', 'zum'],
  it: ['il', 'la', 'di', 'che', 'è', 'per', 'una', 'del', 'con', 'non', 'sono', 'nel', 'dei', 'alla', 'anche', 'come', 'più', 'questo', 'questa', 'stato', 'suo', 'sua', 'essere', 'delle', 'degli', 'nella', 'tutto', 'dal', 'dalla', 'quale', 'loro', 'dopo', 'molto', 'così', 'ancora', 'ogni', 'fatto', 'quella'],
};

function detectLanguage(text: string): string | null {
  if (!text || text.trim().length < 20) return null;

  const words = text.toLowerCase().split(/\s+/);
  const wordSet = new Set(words);

  let bestLang: string | null = null;
  let bestScore = 0;

  for (const [lang, markers] of Object.entries(LANG_MARKERS)) {
    const score = markers.filter((m) => wordSet.has(m)).length;
    if (score > bestScore) {
      bestScore = score;
      bestLang = lang;
    }
  }

  if (bestScore >= 3) return bestLang;

  const nonLatin = /[\u0400-\u04FF\u0600-\u06FF\u0900-\u097F\u3000-\u9FFF\uAC00-\uD7AF\u0E00-\u0E7F]/;
  if (nonLatin.test(text)) return 'unsupported';

  // Default to English if no other language detected strongly
  return 'en';
}

export default function TextInput() {
  const { inputText, setInputText } = useSession();
  const { t, language, setLanguage } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [langWarning, setLangWarning] = useState<string | null>(null);
  const detectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLangRef = useRef(language);
  const skipDetectRef = useRef(false);

  // When user switches language from dropdown, translate the input text
  useEffect(() => {
    const prevLang = prevLangRef.current;
    prevLangRef.current = language;

    if (prevLang !== language && inputText.trim().length > 0) {
      skipDetectRef.current = true;
      translateText(inputText, prevLang, language)
        .then((translated) => {
          setInputText(translated);
          skipDetectRef.current = false;
        })
        .catch(() => {
          skipDetectRef.current = false;
        });
    }
  }, [language]);

  function handleTextChange(text: string) {
    setInputText(text);
    setLangWarning(null);

    if (skipDetectRef.current) return;

    if (detectTimeout.current) clearTimeout(detectTimeout.current);
    detectTimeout.current = setTimeout(() => {
      const detected = detectLanguage(text);
      if (detected === 'unsupported') {
        setLangWarning(t('input.unsupportedLanguage'));
      } else if (detected && detected !== language && SUPPORTED_LANGS.includes(detected)) {
        skipDetectRef.current = true;
        setLanguage(detected);
        setTimeout(() => { skipDetectRef.current = false; }, 1000);
      }
    }, 500);
  }

  async function handleGenerate(category?: string) {
    setIsGenerating(true);
    setError(null);
    setLangWarning(null);
    try {
      const result = await generateText(category, language);
      skipDetectRef.current = true;
      setInputText(result.text);
      setTimeout(() => { skipDetectRef.current = false; }, 1000);
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
        onChange={(e) => handleTextChange(e.target.value)}
        placeholder={t('input.placeholder')}
        className="w-full h-40 bg-white/5 border border-white/20 text-white rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-500"
      />
      {langWarning && (
        <p className="text-yellow-400 text-xs">{langWarning}</p>
      )}
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
            {t(`categories.${cat}`)}
          </button>
        ))}
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}
