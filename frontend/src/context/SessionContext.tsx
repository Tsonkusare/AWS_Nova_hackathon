import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AvatarConfig, AnalysisResult } from '../types';
import { defaultAvatarConfig } from '../types';

interface SessionContextType {
  avatarConfig: AvatarConfig;
  setAvatarConfig: (config: AvatarConfig) => void;
  inputText: string;
  setInputText: (text: string) => void;
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(defaultAvatarConfig);
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  function resetSession() {
    setInputText('');
    setUploadedFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  }

  return (
    <SessionContext.Provider
      value={{
        avatarConfig, setAvatarConfig,
        inputText, setInputText,
        uploadedFile, setUploadedFile,
        analysisResult, setAnalysisResult,
        isAnalyzing, setIsAnalyzing,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}
