import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { useSession } from '../../../context/SessionContext';
import AvatarScene from '../../advisor/AdvisorAvatar/AvatarScene';
import AvatarCustomizer from './AvatarCustomizer';
import { defaultAvatarConfig } from '../../../types';
import type { AvatarConfig } from '../../../types';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish - Español' },
  { code: 'de', label: 'German - Deutsch' },
  { code: 'it', label: 'Italian - Italiano' },
  { code: 'fr', label: 'French - Français' },
];

function SearchableLanguageSelect({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = LANGUAGES.find((l) => l.code === value);
  const filtered = LANGUAGES.filter((l) =>
    l.label.toLowerCase().includes(search.toLowerCase()) ||
    l.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen(!open); setSearch(''); }}
        className="w-full bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        <span>{selected?.label || t('welcome.selectLanguagePlaceholder')}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden">
          <div className="p-2 border-b border-white/10">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('welcome.searchLanguages')}
              className="w-full bg-white/10 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400">{t('welcome.noLanguages')}</div>
            ) : (
              filtered.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { onChange(lang.code); setOpen(false); setSearch(''); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    value === lang.code
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-200 hover:bg-white/10'
                  }`}
                >
                  {lang.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
          <SearchableLanguageSelect value={language} onChange={setLanguage} />
        </div>

        <div>
          <label className="text-sm text-slate-300 block mb-3">{t('welcome.selectAvatar')}</label>
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2 bg-white/5 border border-white/10 rounded-xl" style={{ height: '320px' }}>
              <AvatarScene config={localConfig} />
            </div>
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
