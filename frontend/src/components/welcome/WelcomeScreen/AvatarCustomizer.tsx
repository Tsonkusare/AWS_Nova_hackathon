import { useState } from 'react';
import type { AvatarConfig, Gender } from '../../../types';

interface AvatarCustomizerProps {
  config: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
}

const skinTones: { value: string; label: string }[] = [
  { value: '#fde7c4', label: 'Light' },
  { value: '#f5d0a9', label: 'Fair' },
  { value: '#e8b88a', label: 'Medium Light' },
  { value: '#c68642', label: 'Medium' },
  { value: '#a0704e', label: 'Tan' },
  { value: '#7b5035', label: 'Medium Dark' },
  { value: '#5a3825', label: 'Dark' },
  { value: '#3b2414', label: 'Deep' },
];

const hairColors: { value: string; label: string }[] = [
  { value: '#2c1b18', label: 'Black' },
  { value: '#4a3728', label: 'Dark Brown' },
  { value: '#8b6f47', label: 'Brown' },
  { value: '#c9a96e', label: 'Light Brown' },
  { value: '#e6c87a', label: 'Blonde' },
  { value: '#b34038', label: 'Red' },
  { value: '#d45f2b', label: 'Auburn' },
  { value: '#6b21a8', label: 'Purple' },
];

const shirtColors: { value: string; label: string }[] = [
  { value: '#1a1a2e', label: 'Navy' },
  { value: '#2d3a4a', label: 'Charcoal' },
  { value: '#1e3a5f', label: 'Blue' },
  { value: '#4a2040', label: 'Plum' },
  { value: '#2d4a2e', label: 'Forest Green' },
  { value: '#c0392b', label: 'Red' },
  { value: '#f39c12', label: 'Gold' },
  { value: '#ffffff', label: 'White' },
];

const pantsColors: { value: string; label: string }[] = [
  { value: '#1a1a2e', label: 'Navy' },
  { value: '#2d3a4a', label: 'Charcoal' },
  { value: '#3b2414', label: 'Brown' },
  { value: '#1e3a5f', label: 'Blue' },
  { value: '#2d4a2e', label: 'Forest Green' },
  { value: '#4a3520', label: 'Tan' },
  { value: '#222222', label: 'Black' },
  { value: '#4a4a4a', label: 'Gray' },
];

const genders: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

function ColorDropdown({ label, options, selected, onSelect }: {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
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
        <span className="flex-1 text-left">{selectedOption?.label || 'Select'}</span>
        <span className="text-slate-400">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-slate-800 border border-white/10 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {options.map(({ value, label: optLabel }) => (
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
              {optLabel}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AvatarCustomizer({ config, onChange }: AvatarCustomizerProps) {
  function update(partial: Partial<AvatarConfig>) {
    onChange({ ...config, ...partial });
  }

  return (
    <div className="space-y-4 text-left pr-2">
      <div>
        <label className="text-xs text-slate-400 block mb-1">Gender</label>
        <select
          value={config.gender}
          onChange={(e) => update({ gender: e.target.value as Gender })}
          className="w-full px-3 py-2 rounded-lg bg-white/10 text-sm text-slate-200 border-none outline-none"
        >
          {genders.map(({ value, label }) => (
            <option key={value} value={value} className="bg-slate-800">{label}</option>
          ))}
        </select>
      </div>

      <ColorDropdown label="Skin Tone" options={skinTones} selected={config.skinColor} onSelect={(c) => update({ skinColor: c })} />
      <ColorDropdown label="Hair Color" options={hairColors} selected={config.hairColor} onSelect={(c) => update({ hairColor: c })} />
      <ColorDropdown label="Shirt Color" options={shirtColors} selected={config.shirtColor} onSelect={(c) => update({ shirtColor: c })} />
      <ColorDropdown label="Pants Color" options={pantsColors} selected={config.pantsColor} onSelect={(c) => update({ pantsColor: c })} />
    </div>
  );
}
