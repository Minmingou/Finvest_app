import { Question, QUESTION_DIFFICULTIES, QUESTION_TYPES } from '../types/quiz';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const MIN_OPTION_COUNT = 4;

/** 문제 한 개의 필드가 Quiz Session에 들어갈 수 있는 최소 조건을 만족하는지 검사한다. */
export function validateQuestion(question: Question): ValidationResult {
  const errors: string[] = [];

  if (!question.id || question.id.trim().length === 0) {
    errors.push('id 필드가 비어 있습니다.');
  }
  if (!question.lessonId || question.lessonId.trim().length === 0) {
    errors.push('lessonId 필드가 비어 있습니다.');
  }
  if (!question.question || question.question.trim().length === 0) {
    errors.push('question 필드가 비어 있습니다.');
  }
  if (!Array.isArray(question.options) || question.options.length < MIN_OPTION_COUNT) {
    errors.push(`선택지가 최소 ${MIN_OPTION_COUNT}개 필요합니다.`);
  }
  if (
    typeof question.correctAnswer !== 'number' ||
    !Number.isInteger(question.correctAnswer) ||
    question.correctAnswer < 0 ||
    question.correctAnswer >= (question.options?.length ?? 0)
  ) {
    errors.push('correctAnswer가 options 범위를 벗어났거나 유효하지 않습니다.');
  }
  if (!question.explanation || question.explanation.trim().length === 0) {
    errors.push('explanation 필드가 비어 있습니다.');
  }
  if (!QUESTION_DIFFICULTIES.includes(question.difficulty)) {
    errors.push(`difficulty 값이 유효하지 않습니다: ${question.difficulty}`);
  }
  if (!QUESTION_TYPES.includes(question.type)) {
    errors.push(`type 값이 유효하지 않습니다: ${question.type}`);
  }
  if (!Array.isArray(question.tags)) {
    errors.push('tags는 배열이어야 합니다.');
  }

  return { valid: errors.length === 0, errors };
}

export interface InvalidQuestionReport {
  question: Question;
  errors: string[];
}

export interface QuestionBankValidationResult {
  validQuestions: Question[];
  invalidQuestions: InvalidQuestionReport[];
}

/** 문제은행 전체를 검사해 유효한 문제와, id 중복을 포함해 유효하지 않은 문제를 분리한다.
 * Question Selection Engine은 validQuestions만 출제 대상으로 사용해야 한다. */
export function validateQuestionBank(questions: Question[]): QuestionBankValidationResult {
  const seenIds = new Set<string>();
  const validQuestions: Question[] = [];
  const invalidQuestions: InvalidQuestionReport[] = [];

  for (const question of questions) {
    const { errors } = validateQuestion(question);
    const allErrors = [...errors];

    if (question.id && seenIds.has(question.id)) {
      allErrors.push(`중복된 id입니다: ${question.id}`);
    }

    if (allErrors.length === 0) {
      seenIds.add(question.id);
      validQuestions.push(question);
    } else {
      invalidQuestions.push({ question, errors: allErrors });
    }
  }

  return { validQuestions, invalidQuestions };
}
