import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';
import AvatarScene from './AvatarScene';

export default function AdvisorAvatar() {
  const { avatarConfig, analysisResult, isAnalyzing } = useSession();
  const { t } = useLanguage();

  const message = isAnalyzing
    ? t('advisor.thinking')
    : analysisResult
      ? analysisResult.explanation
      : t('advisor.greeting');

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <AvatarScene config={avatarConfig} size="h-96" />

      <div className="bg-white/5 border border-white/10 rounded-xl p-4 w-full">
        {isAnalyzing ? (
          <div className="flex items-center gap-2 text-blue-300">
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <span className="ml-2 text-sm">{message}</span>
          </div>
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed">{message}</p>
        )}
      </div>
    </div>
  );
}
