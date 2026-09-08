import React, { createContext, useContext, useMemo, useState } from 'react';
import { QuizResult } from '../types';
import { XP_PER_LESSON, XP_PER_CORRECT_ANSWER, levelFromXp } from '../utils/xp';

interface ProgressState {
  level: number;
  xp: number;
  streak: number;
  completedLessonIds: string[];
  quizResults: QuizResult[];
}

interface ProgressContextValue extends ProgressState {
  /** 아직 완료하지 않은 레슨이면 true를 반환하며 XP를 지급한다. 이미 완료한 레슨이면 false를 반환하고 아무 것도 하지 않는다. */
  completeLesson: (lessonId: string) => boolean;
  /** 퀴즈 결과를 기록하고 정답 수에 비례한 XP를 지급한 뒤, 지급된 XP를 반환한다. */
  recordQuizResult: (score: number, total: number) => number;
}

// 임시 초기 데이터 (아직 DB/백엔드 연동 전)
const initialState: ProgressState = {
  level: 1,
  xp: 120,
  streak: 3,
  completedLessonIds: [],
  quizResults: [],
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(initialState);

  const completeLesson = (lessonId: string): boolean => {
    if (state.completedLessonIds.includes(lessonId)) {
      return false;
    }
    setState((prev) => {
      if (prev.completedLessonIds.includes(lessonId)) {
        return prev;
      }
      const nextXp = prev.xp + XP_PER_LESSON;
      return {
        ...prev,
        xp: nextXp,
        level: levelFromXp(nextXp),
        completedLessonIds: [...prev.completedLessonIds, lessonId],
      };
    });
    return true;
  };

  const recordQuizResult = (score: number, total: number): number => {
    const xpEarned = score * XP_PER_CORRECT_ANSWER;
    setState((prev) => {
      const nextXp = prev.xp + xpEarned;
      return {
        ...prev,
        xp: nextXp,
        level: levelFromXp(nextXp),
        quizResults: [...prev.quizResults, { score, total }],
      };
    });
    return xpEarned;
  };

  const value = useMemo<ProgressContextValue>(
    () => ({ ...state, completeLesson, recordQuizResult }),
    [state]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return ctx;
}
