import React, { createContext, useContext, useMemo, useState } from 'react';
import { QuizResult } from '../types';

interface ProgressState {
  level: number;
  xp: number;
  streak: number;
  completedLessonIds: string[];
  quizResults: QuizResult[];
}

interface ProgressContextValue extends ProgressState {
  completeLesson: (lessonId: string) => void;
  recordQuizResult: (score: number, total: number) => void;
}

const XP_PER_LESSON = 20;
const XP_PER_LEVEL = 100;

// 임시 초기 데이터 (아직 DB/백엔드 연동 전)
const initialState: ProgressState = {
  level: 1,
  xp: 120,
  streak: 3,
  completedLessonIds: [],
  quizResults: [],
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(initialState);

  const completeLesson = (lessonId: string) => {
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
  };

  const recordQuizResult = (score: number, total: number) => {
    setState((prev) => ({
      ...prev,
      quizResults: [...prev.quizResults, { score, total }],
    }));
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
