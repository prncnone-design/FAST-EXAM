
import React, { useState, useRef } from 'react';
import { Exam, UserAnswer, QuestionType } from '../types';

interface ExamPaperProps {
  exam: Exam;
  onSubmit: (answers: UserAnswer[]) => void;
}

const ExamPaper: React.FC<ExamPaperProps> = ({ exam, onSubmit }) => {
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionId === questionId);
      if (existing) return prev.map(a => a.questionId === questionId ? { ...a, answer } : a);
      return [...prev, { questionId, answer }];
    });
  };

  const getAnswer = (questionId: string) => answers.find(a => a.questionId === questionId)?.answer || '';

  const scrollToQuestion = (index: number) => {
    setActiveQuestionIndex(index);
    questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleMatchingAnswer = (questionId: string, key: string, value: string) => {
    const currentAnswerStr = getAnswer(questionId);
    let currentPairs: Record<string, string> = {};
    try {
      if (currentAnswerStr) currentPairs = JSON.parse(currentAnswerStr);
    } catch (e) { currentPairs = {}; }
    currentPairs[key] = value;
    handleAnswer(questionId, JSON.stringify(currentPairs));
  };

  const handleSubmit = () => {
    const confirmSubmit = window.confirm("Are you sure you want to submit your answers for grading?");
    if (confirmSubmit) {
      onSubmit(answers);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative pb-28">
      {/* Sidebar Navigator */}
      <aside className="lg:w-16 flex-shrink-0 lg:sticky lg:top-20 h-fit">
        <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-sm lg:flex lg:flex-col grid grid-cols-6 gap-2">
          {exam.questions.map((q, i) => {
            const isAnswered = answers.some(a => a.questionId === q.id && a.answer !== '');
            return (
              <button
                key={q.id}
                onClick={() => scrollToQuestion(i)}
                className={`w-10 h-10 rounded-lg font-bold transition-all text-xs border ${
                  activeQuestionIndex === i 
                    ? 'bg-black text-white border-black shadow-md' 
                    : isAnswered 
                      ? 'bg-slate-100 text-slate-900 border-slate-200' 
                      : 'text-slate-400 border-slate-100 hover:border-slate-300'
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Paper Content */}
      <div className="flex-1 space-y-6">
        <div className="border-b border-slate-200 pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 uppercase">{exam.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Standard Exam Protocol</span>
            <span className="text-[10px] font-bold text-black uppercase tracking-widest">{exam.questions.length} Questions</span>
          </div>
        </div>

        {exam.questions.map((q, index) => (
          <div 
            key={q.id} 
            ref={el => questionRefs.current[index] = el}
            className={`bg-white p-6 rounded-xl border transition-all duration-200 ${
              activeQuestionIndex === index ? 'border-black shadow-sm' : 'border-slate-100'
            }`}
            onClick={() => setActiveQuestionIndex(index)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ITEM {index + 1} • {q.points} POINTS
                </span>
                <span className="text-[10px] font-bold text-slate-300 uppercase">{q.type}</span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-2">{q.instructions || 'PLEASE ANSWER THE FOLLOWING:'}</p>
                <h2 className="text-base font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">{q.text}</h2>
              </div>
              
              <div className="pt-2">
                {q.type === QuestionType.MCQ && q.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleAnswer(q.id, opt)}
                        className={`text-left p-3 rounded-lg border transition-all text-sm ${
                          getAnswer(q.id) === opt 
                            ? 'border-black bg-slate-50 font-semibold' 
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span className="opacity-30 mr-2 font-mono">{String.fromCharCode(65 + i)}.</span>
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === QuestionType.TRUE_FALSE && (
                  <div className="flex gap-2">
                    {['True', 'False'].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleAnswer(q.id, opt)}
                        className={`flex-1 py-3 rounded-lg border text-sm font-semibold transition-all ${
                          getAnswer(q.id) === opt 
                            ? 'bg-black text-white border-black' 
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {opt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}

                {q.type === QuestionType.MATCHING && q.matchingPairs && (
                  <div className="space-y-2 border-l-2 border-slate-100 pl-4">
                    {q.matchingPairs.map((pair, i) => {
                      let currentSelection = '';
                      try {
                        const pairs = JSON.parse(getAnswer(q.id));
                        currentSelection = pairs[pair.key] || '';
                      } catch (e) { currentSelection = ''; }
                      return (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 py-1">
                          <div className="flex-1 text-sm font-medium text-slate-600">{pair.key}</div>
                          <select 
                            className="flex-1 p-2 bg-white border border-slate-200 rounded text-sm outline-none"
                            value={currentSelection}
                            onChange={(e) => handleMatchingAnswer(q.id, pair.key, e.target.value)}
                          >
                            <option value="">Select match...</option>
                            {q.options?.map((opt, idx) => (
                              <option key={idx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}

                {(q.type === QuestionType.FILL_IN_BLANK || q.type === QuestionType.WORKOUT) && (
                  <textarea
                    rows={q.type === QuestionType.WORKOUT ? 4 : 1}
                    placeholder="Enter your response clearly..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm font-medium focus:border-slate-400 focus:bg-white transition-all"
                    value={getAnswer(q.id)}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Persistent Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-slate-200 z-50">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="hidden sm:block">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">PROGRESS:</span>
            <span className="text-sm font-bold">{answers.length} / {exam.questions.length} Completed</span>
          </div>
          <button
            onClick={handleSubmit}
            className="bg-black text-white px-10 py-3 rounded-lg font-bold text-sm tracking-tight hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            SUBMIT EXAM FOR GRADING
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamPaper;
