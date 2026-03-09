import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useSession } from '../../../context/SessionContext';
import type { Language } from '../../../types';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { resetSession } = useSession();
  const navigate = useNavigate();

  function handleNewAnalysis() {
    resetSession();
  }

  function handleHome() {
    resetSession();
    navigate('/');
  }

  return (
    <nav className="bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-3 flex items-center justify-between">
      <button onClick={handleHome} className="text-lg font-bold text-white hover:text-blue-300 transition-colors">
        {t('app.title')}
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={handleHome}
          className="text-sm bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-1.5 rounded-lg transition-colors border border-white/10"
        >
          Back to Home
        </button>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-white/10 border border-white/20 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="en" className="bg-slate-800">English</option>
          <option value="es" className="bg-slate-800">Spanish</option>
        </select>

        <button
          onClick={handleNewAnalysis}
          className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors"
        >
          {t('nav.newAnalysis')}
        </button>

        <button
          onClick={handleHome}
          className="text-sm bg-white/10 hover:bg-white/20 text-slate-300 px-4 py-1.5 rounded-lg transition-colors border border-white/10"
        >
          {t('nav.resetSession')}
        </button>
      </div>
    </nav>
  );
}
