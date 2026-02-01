
import React, { useState } from 'react';
import { AppStep, Exam, UserAnswer, ExamResult, QuestionType } from './types';
import { parseExamContent, gradeExam } from './geminiService';
import ExamInput from './components/ExamInput';
import ExamPaper from './components/ExamPaper';
import ExamResults from './components/ExamResults';
import Header from './components/Header';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('INPUT');
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [result, setResult] = useState<ExamResult | null>(null);

  const handleStartExam = async (text: string, files: { data: string, mimeType: string }[]) => {
    setIsLoading(true);
    setLoadingText('DIGITIZING EXAM...');
    try {
      const data = await parseExamContent(text, files);
      setExam(data);
      setStep('EXAM');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateScore = async (userAnswers: UserAnswer[]) => {
    if (!exam) return;
    setIsLoading(true);
    setLoadingText('GRADING SUBMISSION...');
    try {
      const gradingResult = await gradeExam(exam.questions, userAnswers);
      setResult(gradingResult);
      setStep('RESULT');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      alert('Grading failed. Please try submitting again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setStep('INPUT');
    setExam(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900">
      <Header onLogoClick={resetApp} />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {isLoading && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center space-y-6">
            <div className="w-12 h-12 border-4 border-black border-t-slate-200 rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="font-bold text-xl tracking-tight uppercase">{loadingText}</p>
              <p className="text-slate-400 font-medium text-sm mt-1">ABDY TAH Precision Engine</p>
            </div>
          </div>
        )}

        {step === 'INPUT' && (
          <ExamInput onGenerate={handleStartExam} />
        )}

        {step === 'EXAM' && exam && (
          <ExamPaper 
            exam={exam} 
            onSubmit={calculateScore} 
          />
        )}

        {step === 'RESULT' && result && (
          <ExamResults 
            result={result} 
            onRestart={resetApp} 
          />
        )}
      </main>

      <footer className="py-8 border-t border-slate-200 bg-white text-center text-slate-400 text-xs font-semibold uppercase tracking-widest">
        ABDY TAH • {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default App;
