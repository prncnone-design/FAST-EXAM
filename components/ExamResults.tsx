
import React from 'react';
import { ExamResult } from '../types';

interface ExamResultsProps {
  result: ExamResult;
  onRestart: () => void;
}

const ExamResults: React.FC<ExamResultsProps> = ({ result, onRestart }) => {
  const percentage = Math.round((result.score / result.totalPoints) * 100);

  return (
    <div className="space-y-6 animate-in zoom-in-95 duration-500 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center space-y-3">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Exam Report Card</h2>
        <div className="flex items-center justify-center gap-4">
          <span className="text-4xl font-bold tracking-tight text-slate-900">{result.score}</span>
          <span className="text-xl text-slate-200">/</span>
          <span className="text-xl text-slate-400 font-medium">{result.totalPoints}</span>
        </div>
        <div className="inline-block px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full uppercase tracking-widest">
          SCORE: {percentage}%
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Detailed Evaluation Breakdown</h3>
        {result.breakdown.map((item, i) => (
          <div 
            key={i} 
            className={`p-5 rounded-xl border transition-all ${
              item.isCorrect ? 'bg-green-50/20 border-green-100' : 'bg-red-50/20 border-red-100'
            }`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-[10px] text-slate-400 uppercase">Question {i + 1}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded text-white uppercase ${
                item.isCorrect ? 'bg-green-600' : 'bg-red-600'
              }`}>
                {item.earnedPoints} Points Earned
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Your Response:</p>
                <p className="text-sm font-medium text-slate-800 italic">"{item.userAnswer || 'No response provided'}"</p>
              </div>
              {!item.isCorrect && (
                <div className="pt-2 border-t border-red-100/50">
                  <p className="text-[9px] font-bold text-red-500 uppercase tracking-tighter mb-0.5">Corrective Note:</p>
                  <p className="text-sm font-medium text-slate-700">{item.correctAnswer}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full bg-slate-100 text-slate-900 py-3 rounded-lg font-bold text-sm hover:bg-black hover:text-white transition-all uppercase tracking-widest"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default ExamResults;
