export const XP_PER_LESSON = 20;
export const XP_PER_CORRECT_ANSWER = 10;
export const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpIntoCurrentLevel(xp: number): number {
  return xp % XP_PER_LEVEL;
}

export function xpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - xpIntoCurrentLevel(xp);
}

export function levelProgressRatio(xp: number): number {
  return xpIntoCurrentLevel(xp) / XP_PER_LEVEL;
}
