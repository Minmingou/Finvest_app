export interface Lesson {
  id: string;
  title: string;
  summary: string;
  example: string;
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
