const DAY_MS = 24 * 60 * 60 * 1000;

/** 기기의 로컬 자정 기준 날짜 키(YYYY-MM-DD)를 반환한다. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dateKeyToTime(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function daysBetweenKeys(fromKey: string, toKey: string): number {
  return Math.round((dateKeyToTime(toKey) - dateKeyToTime(fromKey)) / DAY_MS);
}

/**
 * 앱 실행/복귀 시 저장된 streak이 자정을 넘겨서도 여전히 유효한지 계산한다.
 * 마지막 학습일이 오늘/어제면 유지하고, 그보다 오래됐으면 0으로 리셋한다.
 */
export function resolveStreakOnLoad(
  lastStudyDate: string | null,
  storedStreak: number,
  now: Date = new Date()
): number {
  if (!lastStudyDate) return 0;
  const diff = daysBetweenKeys(lastStudyDate, toDateKey(now));
  return diff <= 1 ? storedStreak : 0;
}

/**
 * 학습 완료(레슨/퀴즈) 시점에 streak을 갱신한다.
 * 같은 날 재학습이면 유지, 어제에 이어 학습했으면 +1, 그 외(첫 학습이거나 하루 이상 끊김)는 1로 새로 시작한다.
 */
export function advanceStreakOnStudy(
  lastStudyDate: string | null,
  currentStreak: number,
  now: Date = new Date()
): { streak: number; lastStudyDate: string } {
  const today = toDateKey(now);
  if (lastStudyDate === today) {
    return { streak: currentStreak, lastStudyDate: today };
  }
  if (lastStudyDate && daysBetweenKeys(lastStudyDate, today) === 1) {
    return { streak: currentStreak + 1, lastStudyDate: today };
  }
  return { streak: 1, lastStudyDate: today };
}
