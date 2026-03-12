import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';
import type { RiskLevel as RiskLevelType } from '../../../types';

const riskColors: Record<RiskLevelType, string> = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function RiskLevel() {
  const { analysisResult } = useSession();
  const { t } = useLanguage();

  if (!analysisResult) return null;

  const { riskLevel } = analysisResult;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-400">{t('results.riskLevel')}</h3>
      <div className={`inline-block px-4 py-2 rounded-lg border text-sm font-bold ${riskColors[riskLevel]}`}>
        {t(`results.${riskLevel}`)}
      </div>
    </div>
  );
}
