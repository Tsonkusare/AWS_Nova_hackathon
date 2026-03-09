export type Language = 'en' | 'es';

export type AvatarType = 'lawyer' | 'auditor' | 'assistant';

export type HairStyle = 'short' | 'long' | 'bun' | 'mohawk' | 'buzz';

export type Gender = 'male' | 'female';

export interface AvatarConfig {
  gender: Gender;
  skinColor: string;
  hairStyle: HairStyle;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  glasses: boolean;
}

export const defaultAvatarConfig: AvatarConfig = {
  gender: 'male',
  skinColor: '#c68642',
  hairStyle: 'short',
  hairColor: '#2c1b18',
  shirtColor: '#1a1a2e',
  pantsColor: '#2d3a4a',
  glasses: false,
};

export type RiskLevel = 'low' | 'medium' | 'high';

export type Severity = 'low' | 'medium' | 'high';

export interface Issue {
  title: string;
  description: string;
  severity: Severity;
}

export interface Recommendation {
  title: string;
  description: string;
}

export interface AnalysisResult {
  riskLevel: RiskLevel;
  issues: Issue[];
  recommendations: Recommendation[];
  explanation: string;
}
