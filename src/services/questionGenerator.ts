import { Question, QuestionDifficulty } from '../types/quiz';

export interface GenerateQuestionsParams {
  lessonId: string;
  count: number;
  difficulty?: QuestionDifficulty;
}

/**
 * 향후 AI 문제 생성기를 붙이기 위한 인터페이스.
 *
 * 아직 실제 AI API와 연결되어 있지 않다. 이 함수는 자리표시자(placeholder)이며,
 * 지금은 절대 호출해서는 안 된다 — 현재 문제 출제는 questionEngine.getQuestionsForLesson이
 * src/data/questionBank.ts의 정적 데이터를 사용해 처리한다.
 *
 * 향후 이 함수 내부만 실제 AI 호출로 교체하면 되도록 설계되어 있다:
 *   AI Question Generator → Question Validator(questionValidator.ts) → Question Bank
 * 생성된 문제는 반드시 validateQuestion을 통과한 뒤에만 questionBank에 합류시킨다.
 */
export async function generateQuestionsForLesson(
  params: GenerateQuestionsParams
): Promise<Question[]> {
  throw new Error(
    'AI question generation is not implemented yet. ' +
      'Use questionEngine.getQuestionsForLesson() to draw questions from the static question bank instead.'
  );
}
