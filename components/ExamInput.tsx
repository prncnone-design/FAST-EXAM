
import React, { useState, useRef } from 'react';

interface ExamInputProps {
  onGenerate: (text: string, files: { data: string, mimeType: string }[]) => void;
}

const ExamInput: React.FC<ExamInputProps> = ({ onGenerate }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<{ data: string, mimeType: string, name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;
    Array.from(selectedFiles).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFiles(prev => [...prev, {
            data: event.target!.result as string,
            mimeType: file.type,
            name: file.name
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Digitize Exam Content</h1>
        <p className="text-slate-500 text-base">Paste your text or upload files to start.</p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 space-y-6">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Content Area</label>
          <textarea
            className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-black outline-none transition-all resize-none text-base"
            placeholder="Paste questions here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Attachments</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-lg text-xs font-semibold border border-slate-200">
                <span className="truncate max-w-[120px]">{file.name}</span>
                <button onClick={() => removeFile(i)} className="text-red-500">&times;</button>
              </div>
            ))}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-black hover:text-black transition-all text-sm font-semibold"
          >
            + Add PDF or Image
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*,application/pdf" className="hidden" />
        </div>

        <button
          onClick={() => onGenerate(text, files.map(f => ({ data: f.data, mimeType: f.mimeType })))}
          disabled={!text && files.length === 0}
          className="w-full bg-black text-white py-4 rounded-xl font-bold text-base hover:bg-slate-800 transition-all disabled:bg-slate-200"
        >
          GENERATE EXAM
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-center opacity-60">
        {['Preserve Formatting', 'Auto-Scoring', 'MCQ & Workout', 'Matching Pairs'].map(tag => (
          <div key={tag} className="p-3 bg-slate-100 rounded-lg text-xs font-bold uppercase tracking-tighter">
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExamInput;
