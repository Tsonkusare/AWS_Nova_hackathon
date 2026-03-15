import type { AvatarConfig, Gender } from '../../../types';

interface AvatarCustomizerProps {
  config: AvatarConfig;
  onChange: (config: AvatarConfig) => void;
}

const skinTones = [
  '#fde7c4', '#f5d0a9', '#e8b88a', '#c68642',
  '#a0704e', '#7b5035', '#5a3825', '#3b2414',
];

const hairColors = [
  '#2c1b18', '#4a3728', '#8b6f47', '#c9a96e',
  '#e6c87a', '#b34038', '#d45f2b', '#6b21a8',
];

const shirtColors = [
  '#1a1a2e', '#2d3a4a', '#1e3a5f', '#4a2040',
  '#2d4a2e', '#c0392b', '#f39c12', '#ffffff',
];

const pantsColors = [
  '#1a1a2e', '#2d3a4a', '#3b2414', '#1e3a5f',
  '#2d4a2e', '#4a3520', '#222222', '#4a4a4a',
];

const genders: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

function ColorPicker({ colors, selected, onSelect }: { colors: string[]; selected: string; onSelect: (c: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => onSelect(color)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            selected === color ? 'border-blue-400 scale-110' : 'border-transparent hover:border-white/40'
          }`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function ButtonGroup<T extends string>({ options, selected, onSelect }: { options: { value: T; label: string }[]; selected: T; onSelect: (v: T) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect(value)}
          className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
            selected === value
              ? 'bg-blue-600 text-white'
              : 'bg-white/10 text-slate-400 hover:bg-white/20'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function AvatarCustomizer({ config, onChange }: AvatarCustomizerProps) {
  function update(partial: Partial<AvatarConfig>) {
    onChange({ ...config, ...partial });
  }

  return (
    <div className="space-y-4 text-left max-h-[420px] overflow-y-auto pr-2">
      <div className="space-y-2">
        <label className="text-xs text-slate-400 block">Gender</label>
        <ButtonGroup options={genders} selected={config.gender} onSelect={(v) => update({ gender: v })} />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 block">Skin Tone</label>
        <ColorPicker colors={skinTones} selected={config.skinColor} onSelect={(c) => update({ skinColor: c })} />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 block">Hair Color</label>
        <ColorPicker colors={hairColors} selected={config.hairColor} onSelect={(c) => update({ hairColor: c })} />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 block">Shirt Color</label>
        <ColorPicker colors={shirtColors} selected={config.shirtColor} onSelect={(c) => update({ shirtColor: c })} />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-slate-400 block">Pants Color</label>
        <ColorPicker colors={pantsColors} selected={config.pantsColor} onSelect={(c) => update({ pantsColor: c })} />
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-slate-400">Glasses</label>
        <button
          onClick={() => update({ glasses: !config.glasses })}
          className={`w-10 h-6 rounded-full transition-colors relative ${
            config.glasses ? 'bg-blue-600' : 'bg-white/20'
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
              config.glasses ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
