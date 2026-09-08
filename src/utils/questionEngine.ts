import { questionBank } from '../data/questionBank';
import {
  Question,
  QuestionDifficulty,
  QuestionType,
  QuizSession,
  UserSkillLevel,
} from '../types/quiz';
import { validateQuestionBank } from './questionValidator';

// Quiz Session이 기본으로 몇 문제를 출제할지, 최대 몇 문제까지 허용할지.
// 나중에 "Daily Quiz = 5문제", "Challenge = 10문제" 같은 변형은
// 이 값을 바꾸거나 호출부에서 count를 덮어써서 확장한다.
export const QUIZ_CONFIG = {
  defaultQuestionCount: 3,
  maxQuestionCount: 10,
};

// 문제은행은 로드 시 한 번 검증해, 유효하지 않은 문제(선택지 부족/정답 인덱스 오류 등)는
// 애초에 출제 후보에서 제외한다. 향후 AI가 생성한 문제도 이 검증을 통과해야 문제은행에 합류한다.
const { validQuestions: validatedQuestionBank, invalidQuestions } =
  validateQuestionBank(questionBank);

if (invalidQuestions.length > 0 && typeof __DEV__ !== 'undefined' && __DEV__) {
  console.warn(
    `[questionEngine] 유효하지 않은 문제 ${invalidQuestions.length}개를 출제 대상에서 제외했습니다.`,
    invalidQuestions.map((entry) => ({ id: entry.question.id, errors: entry.errors }))
  );
}

// 초기 사용자의 기본 난이도 구성: easy 위주로 시작하고, 숙련도가 올라갈수록
// medium/hard 비중을 늘린다. 실제 적응형 알고리즘은 이번 단계의 범위 밖이며,
// skillLevel을 입력으로 받아 분포만 바꿔주는 정도로 구조를 마련해둔다.
const DEFAULT_DIFFICULTY_DISTRIBUTION: Record<UserSkillLevel, Record<QuestionDifficulty, number>> = {
  beginner: { easy: 0.7, medium: 0.3, hard: 0 },
  intermediate: { easy: 0.3, medium: 0.5, hard: 0.2 },
  advanced: { easy: 0.1, medium: 0.4, hard: 0.5 },
};

export interface GetQuestionsOptions {
  /** 출제할 문제 수 (기본값: QUIZ_CONFIG.defaultQuestionCount) */
  count?: number;
  /** 특정 난이도만 출제하고 싶을 때 지정한다. 지정하지 않으면 skillLevel 기반 분포를 사용한다. */
  difficulty?: QuestionDifficulty;
  /** 이번 세션에서 제외할 문제 id 목록 (예: 같은 세션 내 중복 방지) */
  excludeQuestionIds?: string[];
  /** 특정 유형만 출제하고 싶을 때 지정한다. */
  questionTypes?: QuestionType[];
  /** 난이도 분포를 결정할 사용자 숙련도 (기본값: 'beginner') */
  skillLevel?: UserSkillLevel;
}

// ---------------------------------------------------------------------------
// Question History Store
//
// "같은 Lesson을 다시 풀면 가능한 다른 문제가 나온다"는 요구를 만족시키기 위해,
// 최근에 출제된 문제 id를 기억해두고 다음 선택에서 우선적으로 피한다.
// 지금은 메모리 기반 구현체를 기본으로 쓰지만, 인터페이스를 분리해두어
// 나중에 DB(사용자별 Question History 테이블)에 연결한 구현체로 교체할 수 있다.
// ---------------------------------------------------------------------------

export interface QuestionHistoryStore {
  getRecentlyUsed(key: string): string[];
  recordUsed(key: string, questionIds: string[]): void;
}

function createInMemoryQuestionHistoryStore(maxRecentPerKey = 20): QuestionHistoryStore {
  const recentByKey = new Map<string, string[]>();

  return {
    getRecentlyUsed(key) {
      return recentByKey.get(key) ?? [];
    },
    recordUsed(key, questionIds) {
      const prev = recentByKey.get(key) ?? [];
      const next = [...prev, ...questionIds].slice(-maxRecentPerKey);
      recentByKey.set(key, next);
    },
  };
}

let historyStore: QuestionHistoryStore = createInMemoryQuestionHistoryStore();

/** 향후 DB 기반 Question History로 교체할 때 이 함수로 구현체를 주입한다. */
export function setQuestionHistoryStore(store: QuestionHistoryStore): void {
  historyStore = store;
}

const MIXED_HISTORY_KEY = '__mixed__';

// ---------------------------------------------------------------------------
// 선택 로직
// ---------------------------------------------------------------------------

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** count를 distribution 비율대로 정수 배분한다 (최대 나머지법으로 합이 count가 되도록 보정). */
function allocateCounts(
  count: number,
  distribution: Record<QuestionDifficulty, number>
): Record<QuestionDifficulty, number> {
  const entries = Object.entries(distribution) as [QuestionDifficulty, number][];
  const raw = entries.map(([difficulty, weight]) => [difficulty, weight * count] as const);
  const allocation: Record<string, number> = {};
  let allocated = 0;

  for (const [difficulty, value] of raw) {
    const floor = Math.floor(value);
    allocation[difficulty] = floor;
    allocated += floor;
  }

  const remainder = count - allocated;
  const byFraction = raw
    .map(([difficulty, value]) => [difficulty, value - Math.floor(value)] as const)
    .sort((a, b) => b[1] - a[1]);

  for (let i = 0; i < remainder; i++) {
    const difficulty = byFraction[i % byFraction.length][0];
    allocation[difficulty] = (allocation[difficulty] ?? 0) + 1;
  }

  return allocation as Record<QuestionDifficulty, number>;
}

/** 후보군을 유형별로 묶어 라운드로빈으로 뽑아, 한쪽 유형에 치우치지 않게 한다. */
function pickDiverseByType(candidates: Question[], count: number): Question[] {
  const groups = new Map<QuestionType, Question[]>();
  for (const question of candidates) {
    const group = groups.get(question.type) ?? [];
    group.push(question);
    groups.set(question.type, group);
  }
  for (const [type, group] of groups) {
    groups.set(type, shuffle(group));
  }

  const groupQueues = Array.from(groups.values());
  const picked: Question[] = [];
  let cursor = 0;
  while (picked.length < count && groupQueues.some((queue) => queue.length > 0)) {
    const queue = groupQueues[cursor % groupQueues.length];
    if (queue.length > 0) {
      picked.push(queue.shift() as Question);
    }
    cursor++;
  }
  return picked;
}

/** 주어진 후보군에서 "제외 목록"은 항상 걸러내고, "최근 출제 이력"은 가능하면 피하되
 * 그 후보군 안에서 정말 부족할 때만 재출제를 허용한다. 난이도 티어 하나, 또는 단일 난이도로
 * 좁혀진 후보군처럼 "이 범위 안에서" 신선도를 판단해야 하는 곳에서 공통으로 사용한다. */
function pickPreferringFresh(
  candidates: Question[],
  count: number,
  excludeSet: Set<string>,
  recentSet: Set<string>
): Question[] {
  const notExcluded = candidates.filter((q) => !excludeSet.has(q.id));
  let usable = notExcluded.filter((q) => !recentSet.has(q.id));
  if (usable.length < count) {
    usable = notExcluded;
  }
  return pickDiverseByType(usable, count);
}

/** 난이도 분포를 지키면서(easy → medium → hard 순으로 부족분을 이월) count개를 선택한다.
 * 신선도(최근 이력 회피)는 난이도 티어 "안에서" 적용한다 — 그래야 특정 난이도의 재고가
 * 먼저 소진됐다고 해서 목표 분포를 벗어나 다른 난이도가 새어 들어가지 않는다. */
function pickByDifficultyDistribution(
  pool: Question[],
  count: number,
  skillLevel: UserSkillLevel,
  excludeSet: Set<string>,
  recentSet: Set<string>
): Question[] {
  const order: QuestionDifficulty[] = ['easy', 'medium', 'hard'];
  const targets = allocateCounts(count, DEFAULT_DIFFICULTY_DISTRIBUTION[skillLevel]);

  const byDifficulty = new Map<QuestionDifficulty, Question[]>(
    order.map((difficulty) => [difficulty, pool.filter((q) => q.difficulty === difficulty)])
  );

  const picked: Question[] = [];
  const pickedIds = new Set<string>();
  let carry = 0;

  for (const difficulty of order) {
    const target = (targets[difficulty] ?? 0) + carry;
    const available = byDifficulty.get(difficulty) ?? [];
    const chosen = pickPreferringFresh(available, target, excludeSet, recentSet);
    picked.push(...chosen);
    chosen.forEach((q) => pickedIds.add(q.id));
    carry = Math.max(0, target - chosen.length);
  }

  // 모든 난이도 티어를 거치고도 목표치를 못 채웠다면(문제은행이 작을 때) 남은 후보로 채운다.
  if (picked.length < count) {
    const remaining = pool.filter((q) => !pickedIds.has(q.id));
    picked.push(...pickPreferringFresh(remaining, count - picked.length, excludeSet, recentSet));
  }

  return picked.slice(0, count);
}

function selectQuestions(pool: Question[], historyKey: string, options: GetQuestionsOptions): Question[] {
  const {
    count = QUIZ_CONFIG.defaultQuestionCount,
    difficulty,
    excludeQuestionIds = [],
    questionTypes,
    skillLevel = 'beginner',
  } = options;

  const targetCount = Math.min(count, QUIZ_CONFIG.maxQuestionCount);

  let candidates = pool;
  if (questionTypes && questionTypes.length > 0) {
    candidates = candidates.filter((q) => questionTypes.includes(q.type));
  }
  if (difficulty) {
    candidates = candidates.filter((q) => q.difficulty === difficulty);
  }

  const excludeSet = new Set(excludeQuestionIds);
  const recentSet = new Set(historyStore.getRecentlyUsed(historyKey));

  const selected = difficulty
    ? pickPreferringFresh(candidates, targetCount, excludeSet, recentSet)
    : pickByDifficultyDistribution(candidates, targetCount, skillLevel, excludeSet, recentSet);

  historyStore.recordUsed(
    historyKey,
    selected.map((q) => q.id)
  );

  return selected;
}

/** Lesson 하나에 속한 문제 중에서 Question Selection Engine이 문제를 골라준다.
 *
 * 예: getQuestionsForLesson('7', { count: 3, difficulty: 'easy' })
 */
export function getQuestionsForLesson(lessonId: string, options: GetQuestionsOptions = {}): Question[] {
  const pool = validatedQuestionBank.filter((q) => q.lessonId === lessonId);
  return selectQuestions(pool, lessonId, options);
}

/** 특정 Lesson에 묶이지 않은 혼합 퀴즈(예: 홈 탭의 전체 퀴즈, 향후 Daily Quiz)를 위한 선택. */
export function getMixedQuestions(options: GetQuestionsOptions = {}): Question[] {
  return selectQuestions(validatedQuestionBank, MIXED_HISTORY_KEY, options);
}

function createSessionId(lessonId: string | null): string {
  const scope = lessonId ?? 'mixed';
  return `${scope}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Quiz 시작 시 문제를 미리 선택해 Quiz Session을 만든다. */
export function createQuizSession(lessonId: string, options: GetQuestionsOptions = {}): QuizSession {
  const questions = getQuestionsForLesson(lessonId, options);
  return {
    sessionId: createSessionId(lessonId),
    lessonId,
    questions,
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    startedAt: Date.now(),
    completedAt: null,
  };
}

/** Lesson에 묶이지 않은 혼합 Quiz Session (예: 홈 탭 퀴즈)을 만든다. */
export function createMixedQuizSession(options: GetQuestionsOptions = {}): QuizSession {
  const questions = getMixedQuestions(options);
  return {
    sessionId: createSessionId(null),
    lessonId: null,
    questions,
    currentIndex: 0,
    score: 0,
    correctCount: 0,
    startedAt: Date.now(),
    completedAt: null,
  };
}

/** Quiz Session을 완료 상태로 마무리한 새 객체를 반환한다 (원본은 변경하지 않는다). */
export function completeQuizSession(
  session: QuizSession,
  result: { score: number; correctCount: number }
): QuizSession {
  return {
    ...session,
    score: result.score,
    correctCount: result.correctCount,
    currentIndex: session.questions.length,
    completedAt: Date.now(),
  };
}
