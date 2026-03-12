import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useSession } from '../../../context/SessionContext';
import AvatarScene from '../../advisor/AdvisorAvatar/AvatarScene';
import AvatarCustomizer from './AvatarCustomizer';
import { defaultAvatarConfig } from '../../../types';
import type { AvatarConfig, Language } from '../../../types';

export default function WelcomeScreen() {
  const { language, setLanguage, t } = useLanguage();
  const { setAvatarConfig } = useSession();
  const navigate = useNavigate();
  const [localConfig, setLocalConfig] = useState<AvatarConfig>(defaultAvatarConfig);

  function handleStart() {
    setAvatarConfig(localConfig);
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 max-w-4xl w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">{t('app.title')}</h1>
          <p className="text-blue-300 mt-2">{t('app.tagline')}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-300 block">{t('welcome.selectLanguage')}</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en" className="bg-slate-800">English</option>
            <option value="es" className="bg-slate-800">Spanish</option>
          </select>
        </div>

        <div>
          <label className="text-sm text-slate-300 block mb-3">{t('welcome.selectAvatar')}</label>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Live 3D Preview */}
            <div className="lg:w-1/2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <AvatarScene config={localConfig} size="h-80" interactive />
            </div>

            {/* Customization Panel */}
            <div className="lg:w-1/2">
              <AvatarCustomizer config={localConfig} onChange={setLocalConfig} />
            </div>
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {t('welcome.startSession')}
        </button>
      </div>
    </div>
  );
}
