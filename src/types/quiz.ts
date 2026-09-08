export const QUESTION_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type QuestionDifficulty = (typeof QUESTION_DIFFICULTIES)[number];

export const QUESTION_TYPES = [
  'concept',
  'calculation',
  'comparison',
  'scenario',
  'application',
] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export const USER_SKILL_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type UserSkillLevel = (typeof USER_SKILL_LEVELS)[number];

export interface Question {
  id: string;
  lessonId: string;
  question: string;
  options: string[];
  /** options 배열에서 정답의 인덱스 */
  correctAnswer: number;
  explanation: string;
  difficulty: QuestionDifficulty;
  type: QuestionType;
  tags: string[];
}

/** 하나의 퀴즈 응시 세션. 화면 단에서는 questions만 소비하고,
 * 나머지 필드는 향후 서버 세션/기록 확장을 대비한 자리다. */
export interface QuizSession {
  sessionId: string;
  lessonId: string | null;
  questions: Question[];
  currentIndex: number;
  score: number;
  correctCount: number;
  startedAt: number;
  completedAt: number | null;
}

export interface QuizResult {
  score: number;
  total: number;
}

/** 향후 사용자별 DB 테이블로 옮길 것을 염두에 둔 답변 기록 한 건. */
export interface UserQuestionHistoryEntry {
  questionId: string;
  lessonId: string;
  isCorrect: boolean;
  answeredAt: number;
  selectedAnswer: number;
  timeSpent: number;
}
