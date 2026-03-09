import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function Recommendations() {
  const { analysisResult } = useSession();
  const { t } = useLanguage();

  if (!analysisResult || analysisResult.recommendations.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-400">{t('results.recommendations')}</h3>
      <div className="space-y-2">
        {analysisResult.recommendations.map((rec, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-300 mb-1">{rec.title}</h4>
            <p className="text-xs text-slate-400">{rec.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
