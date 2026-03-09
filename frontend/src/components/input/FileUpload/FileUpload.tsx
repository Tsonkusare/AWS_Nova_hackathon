import { useRef, useState, type DragEvent } from 'react';
import { useSession } from '../../../context/SessionContext';
import { useLanguage } from '../../../context/LanguageContext';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

export default function FileUpload() {
  const { uploadedFile, setUploadedFile } = useSession();
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFile(file: File) {
    if (ACCEPTED_TYPES.includes(file.type) || file.name.endsWith('.txt') || file.name.endsWith('.pdf') || file.name.endsWith('.docx')) {
      setUploadedFile(file);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/20 hover:border-white/40 bg-white/5'
        }`}
      >
        <p className="text-sm text-slate-400">{t('input.uploadHint')}</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          className="hidden"
        />
      </div>

      {uploadedFile && (
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-4 py-2">
          <span className="text-sm text-slate-300 truncate">{uploadedFile.name}</span>
          <button
            onClick={() => setUploadedFile(null)}
            className="text-slate-500 hover:text-white text-sm ml-2"
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}
