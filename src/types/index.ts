export type LessonDifficulty = '입문' | '초급' | '중급';

export interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: LessonDifficulty;
  estimatedMinutes: number;
  summary: string;
  content: string;
  example: string;
  completed: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizResult {
  score: number;
  total: number;
}
