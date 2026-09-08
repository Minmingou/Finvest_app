import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { QuizResult, UserSkillLevel } from '../types';
import { XP_PER_LESSON, XP_PER_CORRECT_ANSWER, levelFromXp } from '../utils/xp';
import { advanceStreakOnStudy, resolveStreakOnLoad } from '../utils/streak';

interface ProgressState {
  level: number;
  xp: number;
  streak: number;
  /** streak 계산 기준이 되는 마지막 학습일 (YYYY-MM-DD, 로컬 자정 기준) */
  lastStudyDate: string | null;
  completedLessonIds: string[];
  quizResults: QuizResult[];
  /** null이면 아직 실력 진단을 받지 않은 상태 (온보딩에서 /skill-test로 유도) */
  skillLevel: UserSkillLevel | null;
}

interface ProgressContextValue extends ProgressState {
  /** AsyncStorage에서 저장된 진행 상태를 다 불러왔는지 여부. 온보딩 리다이렉트 판단에 사용한다. */
  isHydrated: boolean;
  /** 아직 완료하지 않은 레슨이면 true를 반환하며 XP를 지급한다. 이미 완료한 레슨이면 false를 반환하고 아무 것도 하지 않는다. */
  completeLesson: (lessonId: string) => boolean;
  /** 퀴즈 결과를 기록하고 정답 수에 비례한 XP를 지급한 뒤, 지급된 XP를 반환한다. */
  recordQuizResult: (score: number, total: number) => number;
  /** 실력 레벨을 진단 결과 또는 마이페이지에서의 수동 조정으로 설정한다. */
  setSkillLevel: (level: UserSkillLevel) => void;
}

const STORAGE_KEY = 'finvest:progress:v1';

const initialState: ProgressState = {
  level: 1,
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  completedLessonIds: [],
  quizResults: [],
  skillLevel: null,
};

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProgressState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as ProgressState;
          setState({
            ...initialState,
            ...saved,
            streak: resolveStreakOnLoad(saved.lastStudyDate, saved.streak),
          });
        }
      } catch {
        // 저장된 데이터를 읽지 못하면 기본값으로 시작한다.
      } finally {
        isHydratedRef.current = true;
        setIsHydrated(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const completeLesson = (lessonId: string): boolean => {
    if (state.completedLessonIds.includes(lessonId)) {
      return false;
    }
    setState((prev) => {
      if (prev.completedLessonIds.includes(lessonId)) {
        return prev;
      }
      const nextXp = prev.xp + XP_PER_LESSON;
      const { streak, lastStudyDate } = advanceStreakOnStudy(prev.lastStudyDate, prev.streak);
      return {
        ...prev,
        xp: nextXp,
        level: levelFromXp(nextXp),
        completedLessonIds: [...prev.completedLessonIds, lessonId],
        streak,
        lastStudyDate,
      };
    });
    return true;
  };

  const recordQuizResult = (score: number, total: number): number => {
    const xpEarned = score * XP_PER_CORRECT_ANSWER;
    setState((prev) => {
      const nextXp = prev.xp + xpEarned;
      const { streak, lastStudyDate } = advanceStreakOnStudy(prev.lastStudyDate, prev.streak);
      return {
        ...prev,
        xp: nextXp,
        level: levelFromXp(nextXp),
        quizResults: [...prev.quizResults, { score, total }],
        streak,
        lastStudyDate,
      };
    });
    return xpEarned;
  };

  const setSkillLevel = (level: UserSkillLevel) => {
    setState((prev) => ({ ...prev, skillLevel: level }));
  };

  const value = useMemo<ProgressContextValue>(
    () => ({ ...state, isHydrated, completeLesson, recordQuizResult, setSkillLevel }),
    [state, isHydrated]
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
