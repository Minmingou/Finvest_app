export type LessonCategory = '기초' | '투자상품' | '기업분석' | '투자전략';

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced';

export const DIFFICULTY_LABELS: Record<LessonDifficulty, string> = {
  beginner: '입문',
  intermediate: '중급',
  advanced: '고급',
};

export interface Lesson {
  id: string;
  title: string;
  category: LessonCategory;
  difficulty: LessonDifficulty;
  estimatedMinutes: number;
  /** 한 줄 설명 */
  description: string;
  /** 쉬운 설명 (본문) */
  content: string;
  /** 실제 숫자를 사용한 예시 */
  example: string;
  /** 핵심 포인트 bullet 목록 */
  keyPoints: string[];
  /** 투자자가 기억해야 할 것 */
  takeaway: string;
  completed: boolean;
}
