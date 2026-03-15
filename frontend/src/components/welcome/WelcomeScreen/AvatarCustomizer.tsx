import { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import type { AvatarConfig, Gender } from '../../../types';

interface AvatarCustomizerProps {
  config: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
}

const skinTones: { value: string; key: string }[] = [
  { value: '#fde7c4', key: 'colors.light' },
  { value: '#f5d0a9', key: 'colors.fair' },
  { value: '#e8b88a', key: 'colors.mediumLight' },
  { value: '#c68642', key: 'colors.medium' },
  { value: '#a0704e', key: 'colors.tan' },
  { value: '#7b5035', key: 'colors.mediumDark' },
  { value: '#5a3825', key: 'colors.dark' },
  { value: '#3b2414', key: 'colors.deep' },
];

const hairColors: { value: string; key: string }[] = [
  { value: '#2c1b18', key: 'colors.black' },
  { value: '#4a3728', key: 'colors.darkBrown' },
  { value: '#8b6f47', key: 'colors.brown' },
  { value: '#c9a96e', key: 'colors.lightBrown' },
  { value: '#e6c87a', key: 'colors.blonde' },
  { value: '#b34038', key: 'colors.red' },
  { value: '#d45f2b', key: 'colors.auburn' },
  { value: '#6b21a8', key: 'colors.purple' },
];

const shirtColors: { value: string; key: string }[] = [
  { value: '#1a1a2e', key: 'colors.navy' },
  { value: '#2d3a4a', key: 'colors.charcoal' },
  { value: '#1e3a5f', key: 'colors.blue' },
  { value: '#4a2040', key: 'colors.plum' },
  { value: '#2d4a2e', key: 'colors.forestGreen' },
  { value: '#c0392b', key: 'colors.red' },
  { value: '#f39c12', key: 'colors.gold' },
  { value: '#ffffff', key: 'colors.white' },
];

const pantsColors: { value: string; key: string }[] = [
  { value: '#1a1a2e', key: 'colors.navy' },
  { value: '#2d3a4a', key: 'colors.charcoal' },
  { value: '#3b2414', key: 'colors.brown' },
  { value: '#1e3a5f', key: 'colors.blue' },
  { value: '#2d4a2e', key: 'colors.forestGreen' },
  { value: '#4a3520', key: 'colors.tan' },
  { value: '#222222', key: 'colors.black' },
  { value: '#4a4a4a', key: 'colors.gray' },
];

function ColorDropdown({ label, options, selected, onSelect }: {
  label: string;
  options: { value: string; key: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === selected);

  return (
    <div className="relative">
      <label className="text-xs text-slate-400 block mb-1">{label}</label>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-sm text-slate-200 hover:bg-white/15 transition-colors"
      >
        <span
          className="w-5 h-5 rounded-full border border-white/20 shrink-0"
          style={{ backgroundColor: selected }}
        />
        <span className="flex-1 text-left">{selectedOption ? t(selectedOption.key) : t('colors.select')}</span>
        <span className="text-slate-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.map(({ value, key }) => (
            <button
              key={value}
              onClick={() => { onSelect(value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                selected === value ? 'text-blue-400' : 'text-slate-300'
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: value }}
              />
              {t(key)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AvatarCustomizer({ config, onChange }: AvatarCustomizerProps) {
  const { t } = useLanguage();

  function update(partial: Partial<AvatarConfig>) {
    onChange({ ...config, ...partial });
  }

  return (
    <div className="space-y-4 text-left pr-2">
      <div>
        <label className="text-xs text-slate-400 block mb-1">{t('customize.gender')}</label>
        <select
          value={config.gender}
          onChange={(e) => update({ gender: e.target.value as Gender })}
          className="w-full px-3 py-2 rounded-lg bg-white/10 text-sm text-slate-200 border-none outline-none"
        >
          <option value="male" className="bg-slate-800">{t('customize.male')}</option>
          <option value="female" className="bg-slate-800">{t('customize.female')}</option>
        </select>
      </div>

      <ColorDropdown label={t('customize.skinTone')} options={skinTones} selected={config.skinColor} onSelect={(c) => update({ skinColor: c })} />
      <ColorDropdown label={t('customize.hairColor')} options={hairColors} selected={config.hairColor} onSelect={(c) => update({ hairColor: c })} />
      <ColorDropdown label={t('customize.shirtColor')} options={shirtColors} selected={config.shirtColor} onSelect={(c) => update({ shirtColor: c })} />
      <ColorDropdown label={t('customize.pantsColor')} options={pantsColors} selected={config.pantsColor} onSelect={(c) => update({ pantsColor: c })} />
    </div>
  );
}
