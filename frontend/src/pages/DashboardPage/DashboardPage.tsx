import Navbar from '../../components/layout/Navbar/Navbar';
import AdvisorAvatar from '../../components/advisor/AdvisorAvatar/AdvisorAvatar';
import TextInput from '../../components/input/TextInput/TextInput';
import FileUpload from '../../components/input/FileUpload/FileUpload';
import VoiceInput from '../../components/voice/VoiceInput/VoiceInput';
import AnalyzeButton from '../../components/analysis/AnalyzeButton/AnalyzeButton';
import RiskLevel from '../../components/results/RiskLevel/RiskLevel';
import IssuesList from '../../components/results/IssuesList/IssuesList';
import Recommendations from '../../components/results/Recommendations/Recommendations';
import { useSession } from '../../context/SessionContext';
import { useLanguage } from '../../context/LanguageContext';

export default function DashboardPage() {
  const { analysisResult } = useSession();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      <Navbar />

      <div className="flex flex-col lg:flex-row gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Panel - AI Advisor */}
        <aside className="lg:w-1/3 shrink-0">
          <div className="sticky top-6">
            <AdvisorAvatar />
          </div>
        </aside>

        {/* Right Panel - Input & Results */}
        <main className="flex-1 space-y-6">
          <div className="space-y-4">
            <TextInput />
            <FileUpload />
            <div className="flex items-center gap-3">
              <VoiceInput />
              <div className="flex-1">
                <AnalyzeButton />
              </div>
            </div>
          </div>

          {analysisResult ? (
            <div className="space-y-6 border-t border-white/10 pt-6">
              <RiskLevel />
              <IssuesList />
              <Recommendations />
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">{t('results.noResults')}</p>
          )}
        </main>
      </div>
    </div>
  );
}
