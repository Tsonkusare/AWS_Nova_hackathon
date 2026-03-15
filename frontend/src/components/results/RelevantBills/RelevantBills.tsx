import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';

export default function RelevantBills() {
  const { analysisResult } = useSession();
  const { t } = useLanguage();

  if (!analysisResult?.relevantBills || analysisResult.relevantBills.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 rounded-xl p-5 border border-white/10">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-400 rounded-full" />
        {t('results.relevantRegulations')}
      </h3>
      <div className="space-y-3">
        {analysisResult.relevantBills.map((bill, i) => (
          <div
            key={i}
            className="bg-white/5 rounded-lg p-4 border border-white/5"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-300 rounded">
                {bill.jurisdiction}
              </span>
              <span className="text-sm font-medium text-white">
                {bill.bill_number}
              </span>
              {bill.year && (
                <span className="text-xs text-slate-400">({bill.year})</span>
              )}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {bill.snippet}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
