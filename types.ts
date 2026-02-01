
export enum QuestionType {
  MCQ = 'MCQ',
  TRUE_FALSE = 'TRUE_FALSE',
  FILL_IN_BLANK = 'FILL_IN_BLANK',
  WORKOUT = 'WORKOUT',
  MATCHING = 'MATCHING'
}

export interface MatchingPair {
  key: string;
  value: string;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  instructions?: string;
  options?: string[]; // Used for MCQ or as Column B options for Matching
  matchingPairs?: MatchingPair[]; // New field for matching logic
  correctAnswer: string;
  points: number;
}

export interface Exam {
  title: string;
  questions: Question[];
}

export type AppStep = 'INPUT' | 'EXAM' | 'RESULT';

export interface UserAnswer {
  questionId: string;
  answer: string;
}

export interface ExamResult {
  score: number;
  totalPoints: number;
  breakdown: {
    questionId: string;
    isCorrect: boolean;
    earnedPoints: number;
    correctAnswer: string;
    userAnswer: string;
  }[];
}
