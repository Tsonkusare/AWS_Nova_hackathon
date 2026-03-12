import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';
import type { Severity } from '../../../types';

const severityColors: Record<Severity, string> = {
  low: 'bg-green-500/20 text-green-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-red-500/20 text-red-400',
};

export default function IssuesList() {
  const { analysisResult } = useSession();
  const { t } = useLanguage();

  if (!analysisResult || analysisResult.issues.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-400">{t('results.issues')}</h3>
      <div className="space-y-2">
        {analysisResult.issues.map((issue, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">{issue.title}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${severityColors[issue.severity]}`}>
                {issue.severity}
              </span>
            </div>
            <p className="text-xs text-slate-400">{issue.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
